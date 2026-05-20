-- Creates the private Supabase Storage bucket used for item images and videos.
-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor in the dashboard.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "waiting_list_media_select_own" on storage.objects;
drop policy if exists "waiting_list_media_insert_own" on storage.objects;
drop policy if exists "waiting_list_media_update_own" on storage.objects;
drop policy if exists "waiting_list_media_delete_own" on storage.objects;

create policy "waiting_list_media_select_own"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "waiting_list_media_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "waiting_list_media_update_own"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "waiting_list_media_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
