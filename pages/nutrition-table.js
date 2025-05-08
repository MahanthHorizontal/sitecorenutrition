import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";


export default function NutritionTable() {
  const [jsonData, setJsonData] = useState(null);
  const [fields, setFields] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = router.query;
      if (!id) return;

      const query = `
        query {
          item(id: "${id}", language: "en") {
            id
            name
            fields {
              name
              value
            }
          }
        }
      `;

      const res = await fetch("https://xmcloudcm.localhost/sitecore/api/graph/edge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sc_apikey": "94FE5BDC-BC07-448E-A63C-812FB5974D2E",
        },
        body: JSON.stringify({ query }),
      });

      const result = await res.json();
      if (result?.data?.item) {
        const fieldData = result.data.item.fields.map((f) => ({
          key: f.name,
          name: f.name,
          label: f.name,
          type: "text",
          value: f.value,
        }));
        setJsonData(result.data.item);
        setFields(fieldData);
      }
    };

    fetchData();
  }, [router.query]);

  const updateFieldValue = (key, value) => {
    const newFields = fields.map((field) => {
      if (field.key === key) {
        return { ...field, value };
      }
      return field;
    });
    setFields(newFields);
  };

  return (
    <>
      <Head>
        <title>Nutrition Table</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
        />
      </Head>
      <div className="container mt-4">
        <form id="nutrition_table_form">
          <h1 className="mb-4">Nutrition Table</h1>
          <div id="fields">
            {fields.map((field) => (
              <div className="form-group" key={field.key}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type="text"
                  id={field.key}
                  name={field.name}
                  className="form-control"
                  value={field.value || ""}
                  onChange={(e) => updateFieldValue(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </form>
      </div>
    </>
  );
}
