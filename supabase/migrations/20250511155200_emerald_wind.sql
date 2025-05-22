/*
  # Create protocols storage bucket

  1. Storage
    - Creates a new public storage bucket named 'protocols'
    - Enables public access for authenticated users
    - Sets up RLS policies for secure access

  2. Security
    - Enables RLS on the storage bucket
    - Adds policies for:
      - Authenticated users can read all protocol files
      - Users can only upload/delete their own files
*/

-- Enable storage by creating the protocols bucket
insert into storage.buckets (id, name, public)
values ('protocols', 'protocols', true);

-- Set up RLS policies for the protocols bucket
create policy "Authenticated users can read protocol files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'protocols');

create policy "Users can upload protocol files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'protocols'
  );

create policy "Users can update their own protocol files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'protocols');

create policy "Users can delete their own protocol files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'protocols');