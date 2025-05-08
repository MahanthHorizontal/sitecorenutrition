import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function NutritionTable() {
  const [formData, setFormData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = router.query;
      if (!id) return;

      const query = `
        query {
          item(language:"en", path:"${id}"){
            field(name:"nutrition") {
              value
            }
          }
        }
      `;

      const res = await fetch(
        "https://xmcloudcm.localhost/sitecore/api/graph/edge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            sc_apikey: "94FE5BDC-BC07-448E-A63C-812FB5974D2E",
          },
          body: JSON.stringify({
            query,
            variables: {
              path: `${id}`,
            },
          }),
        }
      );

      const result = await res.json();

      const nutritionValue = result?.data?.item?.field?.value;

      if (nutritionValue) {
        try {
          const nutritionValue = result?.data?.item?.field?.value;
          let parsed = nutritionValue;
          const parsedClone = JSON.parse(parsed);
          setFormData(parsedClone);
        } catch (err) {
          console.error("Failed to parse nutrition data:", err);
        }
      }
    };

    fetchData();
  }, [router.query]);

  const saveNutritionData = async () => {
    const mutation = `
      mutation {
        updateItem(
          input: {
            itemId: "{4092A5B5-39F5-479E-BD4E-6C83E3E81234}"
            fields: [{ name: "nutrition", value: "sdasd" }]
          }
        ) {
          item {
            path
          }
        }
      }
    `;

    const res = await fetch(
      "https://xmcloudcm.localhost/sitecore/api/authoring/graphql/v1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpnbnhyQk9IaXJ0WXp4dnl1WVhNZyJ9.eyJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvZW1haWwiOiJtbWFkYXJhbXBhbGxpQGhvcml6b250YWwuY29tIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL3JvbGVzIjpbIltPcmdhbml6YXRpb25dXFxPcmdhbml6YXRpb24gQWRtaW4iXSwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL2NsaWVudF9uYW1lIjoiWE0gQ2xvdWQgRGVwbG95IChDTEkpIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19pZCI6Im9yZ196dDFrbUFGdjRQdlJOdkE1IiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19uYW1lIjoic2h1cmUtaW5jb3Jwb3JhdGVkLTEiLCJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvb3JnX2Rpc3BsYXlfbmFtZSI6IlNodXJlIEluY29ycG9yYXRlZCIsImh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvL2NsYWltcy9vcmdfYWNjb3VudF9pZCI6IjAwMTFOMDAwMDFVdEdwTVFBViIsImh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvL2NsYWltcy9vcmdfdHlwZSI6ImN1c3RvbWVyIiwic2Nfb3JnX3JlZ2lvbiI6InVzZSIsImlzcyI6Imh0dHBzOi8vYXV0aC5zaXRlY29yZWNsb3VkLmlvLyIsInN1YiI6ImF1dGgwfDYzMThhZmY3MmQ4NzFkZjlkZWY2ODliNiIsImF1ZCI6WyJodHRwczovL2FwaS5zaXRlY29yZWNsb3VkLmlvIiwiaHR0cHM6Ly9vbmUtc2MtcHJvZHVjdGlvbi5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzQ2NjY5MjA2LCJleHAiOjE3NDY3NTU2MDYsInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUgb2ZmbGluZV9hY2Nlc3MgaWFtLnVzcl9yb2xlczpyIHhtY2xvdWRkZXBsb3kucHJvamVjdHM6bWFuYWdlIHhtY2xvdWRkZXBsb3kuZW52aXJvbm1lbnRzOm1hbmFnZSB4bWNsb3VkZGVwbG95Lm9yZ2FuaXphdGlvbnM6bWFuYWdlIHhtY2xvdWRkZXBsb3kuZGVwbG95bWVudHM6bWFuYWdlIHhtY2xvdWRkZXBsb3kubW9uaXRvcmluZy5kZXBsb3ltZW50czpyZWFkIHhtY2xvdWRkZXBsb3kuY2xpZW50czptYW5hZ2UgeG1jbG91ZGRlcGxveS5zb3VyY2Vjb250cm9sOm1hbmFnZSB4bWNsb3VkZGVwbG95LnJoOm1uZyB4bWNsb3VkZGVwbG95LnNpdGU6bW5nIHBsYXRmb3JtLnRlbmFudHM6bGlzdGFsbCIsImF6cCI6IkNoaThFd2ZGbkVlamtzazNTZWQ5aGxhbEdpTTlCMnY3In0.f93tLTpHVfumy0mXyowwST2D8PEkdm6HYWpgAmQgTaw3dowNcRvpt3hSeReFoEpH2zmcc3fCWHhaox-IwuAL0uuEO6CcapAnvNRHBmMwoE71HUiJTrfaZw8qaZyHQlwjs952_zk5rBu0JOcJGQkjSYKd0YJoXUNoUaQnelWKtcAPJRa4XO0RTywVzCXqeE4M0LDTTnrOTda_4G8qEi__wiMnjr5KzlVISj2fXQZVBcbmwOlSUMbGVjN8OFGOlzoleuFhDYo-WiUWGDidI6D7S0Z7OG9hgLlWOREOelfeXTccUNwSJFCxgSzkRJ5NgJEKyKAHiF403aD0YdCS2ewRWw`,
        },
        body: JSON.stringify({ query: mutation }),
      }
    );

    const result = await res.json();
    console.log("Save response:", result);
  };

  const handleAddRow = (fieldKey) => {
    setFormData((prev) => {
      const updatedFields = prev.fields.map((field) => {
        if (field.key === fieldKey) {
          const emptyRow = {};
          field.sub_fields.forEach((sf) => {
            emptyRow[sf.name] = sf.type === "true_false" ? false : "";
          });
          return { ...field, value: [...(field.value || []), emptyRow] };
        }
        return field;
      });
      return { ...prev, fields: updatedFields };
    });
  };

  const handleDeleteRow = (fieldKey, rowIndex) => {
    setFormData((prev) => {
      const updatedFields = prev.fields.map((field) => {
        if (field.key === fieldKey) {
          const newValue = [...field.value];
          newValue.splice(rowIndex, 1);
          return { ...field, value: newValue };
        }
        return field;
      });
      return { ...prev, fields: updatedFields };
    });
  };

  const handleInputChange = (fieldKey, rowIndex, name, value) => {
    setFormData((prev) => {
      const updatedFields = prev.fields.map((field) => {
        if (field.key === fieldKey) {
          const newValue = [...field.value];
          newValue[rowIndex] = { ...newValue[rowIndex], [name]: value };
          return { ...field, value: newValue };
        }
        return field;
      });
      return { ...prev, fields: updatedFields };
    });
  };

  const renderRepeater = (field) => {
    return (
      <div key={field.key} className="form-group">
        <label>{field.label}</label>
        {field.instructions && (
          <small className="form-text text-muted">{field.instructions}</small>
        )}
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              {field.sub_fields.map((subField, subIndex) => (
                <th key={subIndex} className="text-center">
                  <label>{subField.label}</label>
                  {subField.instructions && (
                    <small className="form-text text-muted d-block">
                      {subField.instructions}
                    </small>
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(field.value) &&
              field.value.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{rowIndex + 1}</td>
                  {field.sub_fields.map((subField) => (
                    <td key={subField.key}>
                      {subField.type === "true_false" ? (
                        <input
                          type="checkbox"
                          checked={!!row[subField.name]}
                          onChange={(e) =>
                            handleInputChange(
                              field.key,
                              rowIndex,
                              subField.name,
                              e.target.checked
                            )
                          }
                          className="form-check-input text-center"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[subField.name] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              field.key,
                              rowIndex,
                              subField.name,
                              e.target.value
                            )
                          }
                          className="form-control input-md"
                        />
                      )}
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(field.key, rowIndex)}
                      className="btn btn-outline-danger btn-sm"
                      style={{ borderColor: "#bf1818" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn-info float-right mb-3 text-white"
          onClick={() => handleAddRow(field.key)}
        >
          Add a {field.label}
        </button>
      </div>
    );
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type="text"
              name={field.name}
              defaultValue={field.value || ""}
              className="form-control"
              required={field.required}
            />
            {field.instructions && (
              <small className="form-text text-muted">
                {field.instructions}
              </small>
            )}
          </div>
        );
      case "true_false":
        return (
          <div key={field.key} className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={field.name}
              name={field.name}
              defaultChecked={field.value}
            />
            <label className="form-check-label" htmlFor={field.name}>
              {field.label}
            </label>
            {field.instructions && (
              <small className="form-text text-muted">
                {field.instructions}
              </small>
            )}
          </div>
        );
      case "repeater":
        return renderRepeater(field);
      default:
        return null;
    }
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
        <form>
          <h1 className="mb-4">Nutrition Table</h1>
          {formData?.fields?.map((field, index) => renderField(field, index))}
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={saveNutritionData}
          >
            Save Nutrition Data
          </button>
        </form>
      </div>
    </>
  );
}
