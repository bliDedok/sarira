-- Phase 2 only: no health/body-photo bucket is created.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 1048576, array['image/jpeg', 'image/png', 'image/webp']),
  ('public-assets', 'public-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('private-user-files', 'private-user-files', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "users insert own avatar"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "users read own avatar"
on storage.objects for select to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));

create policy "users update own avatar"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));

create policy "users manage own private files"
on storage.objects for all to authenticated
using (bucket_id = 'private-user-files' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- public-assets is readable because the bucket is public. Writes remain denied by default.
