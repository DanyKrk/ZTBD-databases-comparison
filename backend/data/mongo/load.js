
db.indexes.insertMany([
    {
        index_name: 'nvda_us',
        full_name: 'NVIDIA Corp',
        collection: 'nvda_us_data'
    },
    {
        index_name: 'aapl_us',
        full_name: 'Apple Inc',
        collection: 'aapl_us_data'
    },
    {
        index_name: 'akam_us',
        full_name: 'Akamai Technologies Inc',
        collection: 'akam_us_data'
    },
    {
        index_name: 'amd_us',
        full_name: 'Advanced Microcontroller Devices Inc',
        collection: 'amd_us_data'
    },
    {
        index_name: 'amzn_us',
        full_name: 'Amazon.com Inc',
        collection: 'amzn_us_data'
    },
    {
        index_name: 'ibm_us',
        full_name: 'International Business Machines Corp',
        collection: 'ibm_us_data'
    },
    {
        index_name: 'intc_us',
        full_name: 'Intel Corp',
        collection: 'intc_us_data'
    },
    {
        index_name: 'spx',
        full_name: 'S&P 500 - U.S.',
        collection: 'spx_data'
    },
])
