<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Roles live in `public.user_roles`; partner/driver access is granted only by the `review_application` SQL function (admin-only), never from signup metadata — prevents self-promotion.
- Browser code talks to the database directly with the generated client; RLS is the security boundary, so every new table needs GRANTs + policies.
- Homestay images live in the private `homestay-images` bucket under `<user_id>/...` and are shown via signed URLs (public buckets are blocked in this workspace).
- Form validation schemas live in `src/lib/schemas.ts`; budget/itinerary logic in `src/lib/planner.ts` with tests beside it.
