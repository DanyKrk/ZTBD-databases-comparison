CREATE TABLE if not exists indexes (
    index_id serial primary key,
    index_name text unique,
    full_name text
);

CREATE TABLE if not exists index_company_data (
    index_data_id serial primary key,
    index_id int,
    day date,
    closing decimal,
    highest decimal,
    lowest decimal,
    opening decimal,
    volume decimal,
    garbage bytea,
    FOREIGN KEY (index_id) REFERENCES indexes (index_id)
);

CREATE TABLE if not exists index_data (
    index_data_id serial primary key,
    index_id int,
    day date,
    closing decimal,
    highest decimal,
    lowest decimal,
    opening decimal,
    volume decimal,
    garbage bytea,
    FOREIGN KEY (index_id) REFERENCES indexes (index_id)
);
