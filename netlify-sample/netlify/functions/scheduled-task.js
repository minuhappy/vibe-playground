exports.handler = async function(event, context) {
  const now = new Date().toISOString();
  console.log(`Scheduled function triggered at: ${now}`);
  return {
    statusCode: 200,
    body: `Function ran at: ${now}`
  };
}; 