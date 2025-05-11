export default async function handler(req, res) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
      const response = await fetch(
        "https://xmcloudcm.localhost/sitecore/api/graph/edge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            sc_apikey: "94FE5BDC-BC07-448E-A63C-812FB5974D2E",
          },
          body: JSON.stringify({ query }),
        }
      );

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

    const mutation = `
          mutation {
            updateItem(
              input: {
                itemId: "${id}",
                fields: [
                  {
                    name: "nutrition",
                    value: "asdsa"}
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

    try {
      const apiRes = await fetch(
        "https://xmcloudcm.localhost/sitecore/api/authoring/graphql/v1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpnbnhyQk9IaXJ0WXp4dnl1WVhNZyJ9.eyJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvZW1haWwiOiJtbWFkYXJhbXBhbGxpQGhvcml6b250YWwuY29tIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL3JvbGVzIjpbIltPcmdhbml6YXRpb25dXFxPcmdhbml6YXRpb24gQWRtaW4iXSwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL2NsaWVudF9uYW1lIjoiWE0gQ2xvdWQgRGVwbG95IChDTEkpIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19pZCI6Im9yZ196dDFrbUFGdjRQdlJOdkE1IiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19uYW1lIjoic2h1cmUtaW5jb3Jwb3JhdGVkLTEiLCJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvb3JnX2Rpc3BsYXlfbmFtZSI6IlNodXJlIEluY29ycG9yYXRlZCIsImh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvL2NsYWltcy9vcmdfYWNjb3VudF9pZCI6IjAwMTFOMDAwMDFVdEdwTVFBViIsImh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvL2NsYWltcy9vcmdfdHlwZSI6ImN1c3RvbWVyIiwic2Nfb3JnX3JlZ2lvbiI6InVzZSIsImlzcyI6Imh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvLyIsInN1YiI6ImF1dGgwfDYzMThhZmY3MmQ4NzFkZjlkZWY2ODliNiIsImF1ZCI6WyJodHRwczovL2FwaS5zaXRlY29yZWNsb3VkLmlvIiwiaHR0cHM6Ly9vbmUtc2MtcHJvZHVjdGlvbi5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzQ2OTk4MTE5LCJleHAiOjE3NDcwODQ1MTksInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUgb2ZmbGluZV9hY2Nlc3MgaWFtLnVzcl9yb2xlczpyIHhtY2xvdWRkZXBsb3kucHJvamVjdHM6bWFuYWdlIHhtY2xvdWRkZXBsb3kuZW52aXJvbm1lbnRzOm1hbmFnZSB4bWNsb3VkZGVwbG95Lm9yZ2FuaXphdGlvbnM6bWFuYWdlIHhtY2xvdWRkZXBsb3kuZGVwbG95bWVudHM6bWFuYWdlIHhtY2xvdWRkZXBsb3kubW9uaXRvcmluZy5kZXBsb3ltZW50czpyZWFkIHhtY2xvdWRkZXBsb3kuY2xpZW50czptYW5hZ2UgeG1jbG91ZGRlcGxveS5zb3VyY2Vjb250cm9sOm1hbmFnZSB4bWNsb3VkZGVwbG95LnJoOm1uZyB4bWNsb3VkZGVwbG95LnNpdGU6bW5nIHBsYXRmb3JtLnRlbmFudHM6bGlzdGFsbCIsImF6cCI6IkNoaThFd2ZGbkVlamtzazNTZWQ5aGxhbEdpTTlCMnY3In0.gFoyQ7n4L8n_BMV9AzD1oY0EVc8JZK7ps9SllzacACnvgzMspMzWB6rmTkfkz7CXt4QtVwGkp-xH10YUlC1blZ1sKxCLHdjabFYXmOxMxl3iEs3dZIODXztuU0UHV-jtisubSLaRVRvRCq7HhWhZtZW6qH7ZCZUZLRgTcJXJmntVnvqqwt86mg9ANmtYoNSSULhLci76KaTsM-ekZJ-gc9POWWdLnqFNv1H9glHkt3J_zwb-3wF1nw019k8Jt2OZxA1RJlJnqn214g8TShBPFaVS9i2Uu6UDpws1lmLEQG_RPavb5s3zNToi_f1c5gnkjLTgchqT9JvX1mjOH7lhCg",
          },
          body: JSON.stringify({ query: mutation }),
        }
      );

      const result = await apiRes.json();
      return res.status(200).json(result);
    } catch (error) {
      console.error("GraphQL mutation error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
