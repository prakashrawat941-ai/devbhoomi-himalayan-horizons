
create type public.app_role as enum ('admin','customer','partner','driver');
create type public.approval_status as enum ('pending','approved','rejected');
create type public.cab_route as enum ('delhi_almora','chandigarh_almora');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  city text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.role_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null check (role in ('partner','driver')),
  status approval_status not null default 'pending',
  details jsonb not null default '{}'::jsonb,
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, role)
);
grant select, insert, update on public.role_applications to authenticated;
grant all on public.role_applications to service_role;
alter table public.role_applications enable row level security;
create policy "apps read" on public.role_applications for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "apps insert own pending" on public.role_applications for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "apps owner update details while pending" on public.role_applications for update to authenticated using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid() and status = 'pending');
create policy "apps admin update" on public.role_applications for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- Approval grants/revokes role
create or replace function public.review_application(_app_id uuid, _status approval_status, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare a public.role_applications;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into a from public.role_applications where id = _app_id;
  if not found then raise exception 'Not found'; end if;
  update public.role_applications set status = _status, admin_note = _note, reviewed_at = now() where id = _app_id;
  if _status = 'approved' then
    insert into public.user_roles(user_id, role) values (a.user_id, a.role) on conflict do nothing;
  else
    delete from public.user_roles where user_id = a.user_id and role = a.role;
  end if;
end $$;
revoke execute on function public.review_application(uuid, approval_status, text) from public, anon;
grant execute on function public.review_application(uuid, approval_status, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare req text := new.raw_user_meta_data->>'requested_role';
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone');
  insert into public.user_roles(user_id, role) values (new.id, 'customer');
  if req in ('partner','driver') then
    insert into public.role_applications(user_id, role) values (new.id, req::app_role);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  district text not null,
  altitude_m int,
  summary text not null,
  highlights text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.villages to anon, authenticated;
grant insert, update, delete on public.villages to authenticated;
grant all on public.villages to service_role;
alter table public.villages enable row level security;
create policy "villages public read" on public.villages for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "villages admin write" on public.villages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.homestays (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  village_id uuid references public.villages(id) on delete set null,
  name text not null,
  description text not null,
  rooms int not null default 1 check (rooms between 1 and 50),
  amenities text[] not null default '{}',
  tariff_note text,
  image_path text,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select on public.homestays to anon, authenticated;
grant insert, update, delete on public.homestays to authenticated;
grant all on public.homestays to service_role;
alter table public.homestays enable row level security;
create policy "homestays public approved" on public.homestays for select to anon, authenticated using (status = 'approved' or partner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "homestays partner insert" on public.homestays for insert to authenticated with check (partner_id = auth.uid() and status = 'pending' and public.has_role(auth.uid(),'partner'));
create policy "homestays partner update" on public.homestays for update to authenticated using (partner_id = auth.uid()) with check (partner_id = auth.uid() and status = 'pending');
create policy "homestays partner delete" on public.homestays for delete to authenticated using (partner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "homestays admin update" on public.homestays for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.cultural_content (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  summary text not null,
  body text not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.cultural_content to anon, authenticated;
grant insert, update, delete on public.cultural_content to authenticated;
grant all on public.cultural_content to service_role;
alter table public.cultural_content enable row level security;
create policy "culture public read" on public.cultural_content for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "culture admin write" on public.cultural_content for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  days int not null check (days between 1 and 30),
  travellers int not null check (travellers between 1 and 20),
  style text not null,
  itinerary jsonb not null default '[]'::jsonb,
  budget_min int not null,
  budget_max int not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.trip_plans to authenticated;
grant all on public.trip_plans to service_role;
alter table public.trip_plans enable row level security;
create policy "plans own" on public.trip_plans for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.trip_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid references public.trip_plans(id) on delete set null,
  kind text not null default 'trip' check (kind in ('trip','workation','homestay')),
  name text not null,
  phone text not null,
  travel_date date,
  travellers int not null default 1,
  message text not null default '',
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.trip_enquiries to authenticated;
grant all on public.trip_enquiries to service_role;
alter table public.trip_enquiries enable row level security;
create policy "enq read" on public.trip_enquiries for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "enq insert" on public.trip_enquiries for insert to authenticated with check (user_id = auth.uid() and status = 'new');
create policy "enq admin update" on public.trip_enquiries for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.cab_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  route cab_route not null,
  travel_date date not null,
  passengers int not null check (passengers between 1 and 12),
  pickup_point text not null,
  phone text not null,
  notes text not null default '',
  status text not null default 'requested' check (status in ('requested','driver_assigned','cancelled','completed')),
  driver_id uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.cab_requests to authenticated;
grant all on public.cab_requests to service_role;
alter table public.cab_requests enable row level security;
create policy "cab read" on public.cab_requests for select to authenticated using (user_id = auth.uid() or driver_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "cab insert" on public.cab_requests for insert to authenticated with check (user_id = auth.uid() and status = 'requested' and driver_id is null);
create policy "cab admin update" on public.cab_requests for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "contact insert" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "contact admin read" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- storage policies for homestay images (bucket created separately)
create policy "homestay img public read" on storage.objects for select using (bucket_id = 'homestay-images');
create policy "homestay img partner upload" on storage.objects for insert to authenticated with check (bucket_id = 'homestay-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "homestay img partner delete" on storage.objects for delete to authenticated using (bucket_id = 'homestay-images' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.villages (slug,name,district,altitude_m,summary,highlights) values
('munsiyari','Munsiyari','Pithoragarh',2200,'A high village facing the Panchachuli peaks, gateway to Milam glacier treks.','{"Panchachuli views","Tribal heritage museum","Khaliya Top trek"}'),
('kausani','Kausani','Bageshwar',1890,'Tea gardens and a 300 km sweep of the Himalaya, beloved by Gandhi.','{"Anasakti Ashram","Tea estates","Sunrise ridge"}'),
('jageshwar','Jageshwar','Almora',1870,'Deodar forests hiding over 100 stone temples from the 7th–14th centuries.','{"Temple complex","Deodar walks","Monsoon fair"}'),
('sitlakhet','Sitlakhet','Almora',1800,'Quiet pine ridge with open views and slow village life near Almora.','{"Syahi Devi trail","Pine forests","Stargazing"}'),
('chaukori','Chaukori','Pithoragarh',2010,'Orchards and terraced fields beneath Nanda Devi and Trishul.','{"Orchards","Peak views","Berinag tea history"}'),
('khati','Khati','Bageshwar',2210,'Last village on the Pindari glacier trail, reachable only on foot.','{"Pindari trail","Walnut groves","No road access"}');

insert into public.cultural_content (slug,title,category,summary,body) values
('aipan','Aipan Art','art','Sacred floor and wall art of Kumaon, drawn in rice paste on red ochre.','Aipan is a ritual folk art of Kumaon. Women draw patterns with biswar (rice paste) over a geru (red earth) base on thresholds, courtyards and puja spaces. Designs such as chowkis, lakshmi footprints and swastik motifs mark festivals, births and weddings. Each line is drawn freehand with the fingertips, and patterns pass from mother to daughter.'),
('nanda-devi-raj-jat','Nanda Devi Raj Jat','festival','A Himalayan pilgrimage held roughly once every twelve years, escorting the goddess to her in-laws.','The Raj Jat is a ~280 km pilgrimage from Nauti village near Karnaprayag to Homkund, led by a four-horned ram (chausingya khadu). It symbolises Goddess Nanda returning to her husband Shiva in Kailash. Thousands walk through high meadows such as Bedni Bugyal and Roopkund. Dates are announced by the organising committee; check official sources before planning.'),
('golju-devta','Golju Devta','deity','The god of justice of Kumaon, whose temples are hung with bells and written petitions.','Golu (Golju) Devta is revered as the deity of justice. At the Chitai temple near Almora, devotees write their pleas on paper or stamp paper and tie bells once wishes are granted — thousands of bells line the temple. Other important shrines are at Ghorakhal and Champawat.'),
('dana-holi','Dana Holi','festival','A gentle, musical Holi of Kumaon''s villages, sung in circles over many evenings.','In Kumaon, Holi is celebrated as much through music as colour. Baithki Holi gatherings sing classical raga-based songs indoors, while Khadi Holi sees villagers in white kurtas and caps singing and dancing in circles from house to house. Dana Holi traditions in some villages include community gatherings around the cheer (a ceremonial pole) and shared food.'),
('kumaoni-holi','Local Holi Traditions','festival','Baithki, Khadi and Mahila Holi — three voices of one festival.','Baithki Holi begins weeks before the festival, from Paush, with seated singing. Khadi Holi is the standing, dancing form in village courtyards. Mahila Holi gives women their own gatherings with songs and satire. The festival ends with cheer dahan, the burning of the ceremonial pole.'),
('uttarakhand-culture','Uttarakhand Culture','overview','Devbhoomi — land of the gods, of folk songs, stone homes and forest festivals.','Uttarakhand holds the Garhwal and Kumaon regions. Traditional homes (bakhali) are built of stone, slate and carved wood. Folk forms such as Jhoda, Chhapeli and Jagar keep oral history alive. Festivals like Harela, Phool Dei and Ghee Sankranti follow the agricultural calendar.');
