create table if not exists user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role varchar(32) not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists user_roles_role_idx
  on user_roles(role, user_id);
