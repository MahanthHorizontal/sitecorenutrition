const getAccessToken = async () => {
  const body = new URLSearchParams();
  body.append("client_id", process.env.AuthoringClientID);
  body.append("client_secret", process.env.AuthoringSecretKey);
  body.append("audience", "https://api.sitecorecloud.io");
  body.append("grant_type", "client_credentials");
  const response = await fetch("https://auth.sitecorecloud.io/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await response.json();
  console.log("data", data);
  if (!response.ok) {
    throw new Error(
      `OAuth token request failed: ${data.error || "Unknown error"}`
    );
  }

  return data.access_token;
};

export default async function handler(req, res) {
  console.log("request method", req.method);
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing id parameter" });
    }

    console.log("id", id);

    const query = `
          query {
            item(language: "en", path: "${id}") {
              field(name: "nutrition") {
                value
              }
            }
          }
        `;

    try {
      console.log("isnide thus");
      const response = await fetch(process.env.Sitecore_Preview_ApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          sc_apikey: process.env.Sitecore_Api_key,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("result returned", result);
      const value = result?.data?.item?.field?.value;

      if (!value) {
        return res.status(404).json({ message: "Nutrition data not found" });
      }

      try {
        const parsed = JSON.parse(value);
        return res.status(200).json(parsed);
      } catch (e) {
        console.error("Parsing error:", e);
        return res
          .status(500)
          .json({ error: "Failed to parse nutrition data" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "POST") {
    const { id, data } = req.body;

    if (!id || !data) {
      return res.status(400).json({ message: "Missing id or data in body" });
    }

    const escapedValue = JSON.stringify(data)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    const mutation = `
      mutation {
        updateItem(
          input: {
            itemId: \"${id}\",
            fields: [
              {
                name: \"nutrition\",
                value: \"${escapedValue}\"
              }
            ]
          }
        ) {
          item {
            path
          }
        }
      }
    `;
    console.log("mutation", JSON.stringify(mutation));
    try {
      const token = await getAccessToken();

      const apiRes = await fetch(process.env.Sitecore_Authoring_ApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: mutation }),
      });

      const result = await apiRes.json();
      console.log("result", JSON.stringify(result));
      return res.status(200).json(result);
    } catch (error) {
      console.error("GraphQL mutation error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
