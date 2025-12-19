ALTER TABLE users
ADD FOREIGN KEY (created_by) REFERENCES users(uuid),
ADD FOREIGN KEY (updated_by) REFERENCES users(uuid);

ALTER TABLE businesses
ADD FOREIGN KEY (created_by) REFERENCES users(uuid),
ADD FOREIGN KEY (updated_by) REFERENCES users(uuid);

ALTER TABLE roles
ADD FOREIGN KEY (created_by) REFERENCES users(uuid),
ADD FOREIGN KEY (updated_by) REFERENCES users(uuid);

ALTER TABLE business_users
ADD FOREIGN KEY (created_by) REFERENCES users(uuid);

ALTER TABLE role_permissions
ADD FOREIGN KEY (created_by) REFERENCES users(uuid);
