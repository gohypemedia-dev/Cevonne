const token = "EAASAfHd2LZCkBS9JT40KQN6SJVQsnILLbycNeRZCZC6nwjcdZACqPJZAmIKhW7XDybNDDNwSyK4leN6AEPllE6WotOA805VpEyneJKNuo2MI2eb2fopwTdTeZBkS1uOlXVS84oJrQRgag7kULlvGMcH7A3XmCmpMGYNSSyjaAORQugvjZBeIlmyDcDBdsqKD4mesgZDZD";

async function checkPerms() {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${token}`);
  const data = await res.json();
  console.log("Token permissions:", JSON.stringify(data, null, 2));
}

checkPerms().catch(console.error);
