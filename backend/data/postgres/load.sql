
insert into indexes (index_name, full_name) values ('nvda_us', 'NVIDIA Corp');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_nvda_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('aapl_us', 'Apple Inc');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_aapl_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('akam_us', 'Akamai Technologies Inc');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_akam_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('amd_us', 'Advanced Micro Devices Inc');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_amd_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('amzn_us', 'NVIDIA Corp');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_nvda_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('ibm_us', 'NVIDIA Corp');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_nvda_us_d.csv' with (format csv)

insert into indexes (index_name, full_name) values ('intc_us', 'Intel Corp');
\copy index_company_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_intc_us_d.csv' with (format csv)

insert into indexes (index_id, index_name, full_name) values (10, 'spx', 'S&P 500 - U.S.');
\copy index_data(index_id, day, closing, highest, lowest, opening, volume, garbage) from '/root/data/pg_spx_d.csv' with (format csv)

