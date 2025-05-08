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
        </form>
      </div>
    </>
  );
}
