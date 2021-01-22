-- Your migration code here.create table seafood (
create table seafood (
  id uuid primary key default uuid_generate_v4(),
  info json,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create trigger seafood_moddatetime
  before update on seafood
  for each row
  execute procedure moddatetime (updated_at);
