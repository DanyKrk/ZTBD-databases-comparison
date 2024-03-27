const indexesData = [
    {
        index_name: 'dogs',
        full_name: 'Dogs',
        collection: 'dogs_data'
    },
    {
        index_name: 'breeds',
        full_name: 'Breeds',
        collection: 'breeds_data'
    },
    // TODO: add owners
];

try {
    const result = await db.indexes.insertMany(indexesData);
    console.log('Indexes inserted successfully:', result.insertedCount);
} catch (error) {
    console.error('Error inserting indexes:', error);
}
