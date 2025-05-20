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
                {field.sub_fields.map((subField) => {
                  const inputId = `${field.key}-${subField.name}-${rowIndex}`;
                  return (
                    <td key={subField.key}>
                      {subField.type === "true_false" ? (
                        <input
                          type="checkbox"
                          id={inputId}
                          name={inputId}
                          checked={!!row[subField.name]}
                          className="form-check-input text-center"
                          onChange={(e) =>
                            handleRepeaterChange(
                              field.key,
                              rowIndex,
                              subField.name,
                              e.target.checked
                            )
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          id={inputId}
                          name={inputId}
                          value={row[subField.name] || ""}
                          className="form-control input-md"
                          onChange={(e) =>
                            handleRepeaterChange(
                              field.key,
                              rowIndex,
                              subField.name,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </td>
                  );
                })}
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
