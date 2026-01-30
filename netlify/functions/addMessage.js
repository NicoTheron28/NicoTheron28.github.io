// Import the Supabase client library
const { createClient } = require('@supabase/supabase-js');

// Define your Supabase project URL and API key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the handler function
exports.handler = async (event, context) => {
  try {
    // Parse the incoming request body (which contains the message)
    const data = JSON.parse(event.body);

    // Extract the message from the data
    const { message } = data;

    // Insert the message into the 'messages' table in Supabase
    const { data: inserted, error } = await supabase
      .from('messages')             // Table name
      .insert([{ message }]);       // Data to insert

    // Check for errors during insertion
    if (error) {
      return {
        statusCode: 500, // Internal Server Error
        body: JSON.stringify({ error: error.message }),
      };
    }

    // Return success response
    return {
      statusCode: 200, // OK
      body: JSON.stringify({ message: 'Message added', data: inserted }),
    };
  } catch (err) {
    // Handle parsing errors or unexpected issues
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
