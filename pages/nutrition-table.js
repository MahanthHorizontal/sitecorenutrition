import { useEffect, useState } from "react";
import Head from "next/head";

export default function NutritionTable() {
  const [fields, setFields] = useState([]);
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    // Use postMessage to request field data from Sitecore
    window.parent.postMessage({ type: "get-sc-value" }, "*");

    const listener = (event) => {
      if (!event.data || event.data.type !== "sc-value-response") return;
      try {
        const parsed = JSON.parse(event.data.value || "{}");
        setJsonData(parsed);
        setFields(parsed.fields || []);
      } catch (err) {
        console.error("Failed to parse Sitecore field value", err);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!jsonData) return;
      const updated = JSON.stringify({ ...jsonData, fields });
      window.parent.postMessage({ type: "sitecore-field-update", data: updated }, "*");
    }, 1000);
    return () => clearInterval(interval);
  }, [fields, jsonData]);

  const handleChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].value = value;
    setFields(updatedFields);
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
            {fields.map((field, index) => {
              if (field.type === "text") {
                return (
                  <div className="form-group" key={field.key}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      type="text"
                      id={field.key}
                      name={field.name}
                      className="form-control"
                      defaultValue={field.value}
                      required={field.required}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                    <small className="form-text text-muted">
                      {field.instructions}
                    </small>
                  </div>
                );
              } else if (field.type === "true_false") {
                return (
                  <div className="form-group form-check" key={field.key}>
                    <input
                      type="checkbox"
                      id={field.key}
                      name={field.name}
                      className="form-check-input"
                      defaultChecked={field.value}
                      onChange={(e) => handleChange(index, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={field.name}>
                      {field.label}
                    </label>
                    <small className="form-text text-muted">
                      {field.instructions}
                    </small>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </form>
      </div>
    </>
  );
}
