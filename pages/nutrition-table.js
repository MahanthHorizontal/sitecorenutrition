import { useEffect, useState } from "react";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";

export default function NutritionTable() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    const rawValue = window.frameElement?.getAttribute("sc_value") || "{}";
    try {
      const parsed = JSON.parse(rawValue);
      setJsonData(parsed);
      setFields(parsed.fields || []);
    } catch (err) {
      console.error("Failed to parse Sitecore field value", err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!jsonData) return;
      const updated = JSON.stringify({ ...jsonData, fields });
      window.frameElement?.setAttribute("sc_value", updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [fields, jsonData]);

  const updateFieldValue = (key: string, value: any) => {
    const newFields = fields.map((field) => {
      if (field.key === key) {
        return { ...field, value };
      }
      if (field.type === 'repeater') {
        const updatedSubFields = field.sub_fields.map((sf: any) =>
          sf.key === key ? { ...sf, value } : sf
        );
        return { ...field, sub_fields: updatedSubFields };
      }
      return field;
    });
    setFields(newFields);
  };

  const addRepeaterRow = (repeaterField: any) => {
    const rowIndex = Math.max(...repeaterField.sub_fields.map((sf: any) => sf.row || 0)) + 1;
    const newSubFields = repeaterField.sub_fields
      .filter((sf: any) => sf.row === 0)
      .map((sf: any) => ({
        ...sf,
        key: uuidv4(),
        value: '',
        row: rowIndex
      }));

    const newFields = fields.map((field) => {
      if (field.key === repeaterField.key) {
        return {
          ...field,
          sub_fields: [...field.sub_fields, ...newSubFields]
        };
      }
      return field;
    });
    setFields(newFields);
  };

  const deleteRepeaterRow = (repeaterField: any, row: number) => {
    const newFields = fields.map((field) => {
      if (field.key === repeaterField.key) {
        return {
          ...field,
          sub_fields: field.sub_fields.filter((sf: any) => sf.row !== row)
        };
      }
      return field;
    });
    setFields(newFields);
  };

  const renderRepeater = (field: any) => {
    const rows: { [key: number]: any[] } = {};
    field.sub_fields.forEach((sf: any) => {
      if (!rows[sf.row]) rows[sf.row] = [];
      rows[sf.row].push(sf);
    });

    return (
      <div className="form-group" key={field.key}>
        <label>{field.label}</label>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              {rows[0]?.map((sf: any, i: number) => (
                <th key={i}>{sf.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rows).map(([rowIndex, rowFields]) => (
              <tr key={rowIndex}>
                <td>{parseInt(rowIndex) + 1}</td>
                {rowFields.map((sf: any) => (
                  <td key={sf.key}>
                    <input
                      type="text"
                      className="form-control"
                      value={sf.value || ''}
                      onChange={(e) => updateFieldValue(sf.key, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteRepeaterRow(field, parseInt(rowIndex))}
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
          className="btn btn-info btn-sm float-right"
          onClick={() => addRepeaterRow(field)}
        >
          {field.button_label || 'Add Row'}
        </button>
      </div>
    );
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
            {fields.map((field: any) => {
              if (field.type === "text") {
                return (
                  <div className="form-group" key={field.key}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      type="text"
                      id={field.key}
                      name={field.name}
                      className="form-control"
                      value={field.value || ''}
                      onChange={(e) => updateFieldValue(field.key, e.target.value)}
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
                      checked={field.value || false}
                      onChange={(e) => updateFieldValue(field.key, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={field.name}>
                      {field.label}
                    </label>
                    <small className="form-text text-muted">
                      {field.instructions}
                    </small>
                  </div>
                );
              } else if (field.type === "repeater" && field.layout === "table") {
                return renderRepeater(field);
              }
              return null;
            })}
          </div>
        </form>
      </div>
    </>
  );
}
