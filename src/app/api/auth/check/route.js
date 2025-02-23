export async function GET(request) {
  // Check for Basic Auth header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const authValue = authHeader.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.ADMIN_USERNAME &&
      pwd === process.env.ADMIN_PASSWORD
    ) {
      return new Response(JSON.stringify({ isAuthenticated: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (err) {
    // Handle any errors in auth header parsing
  }

  return new Response("Unauthorized", { status: 401 });
}
