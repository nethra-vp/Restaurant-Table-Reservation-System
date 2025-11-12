import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";

const ListTable = () => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: "" });

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/table/list`);
      if (res.data.success) setTables(res.data.tables);
      else toast.error(res.data.message);
    } catch (error) {
      toast.error("Failed to fetch tables");
    }
  };

  const addTable = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/table/add`, newTable);
      if (res.data.success) {
        toast.success(res.data.message);
        setNewTable({ tableNumber: "", capacity: "" });
        fetchTables();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to add table");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      await axios.delete(`${backendUrl}/api/table/remove/${id}`);
      toast.success("Table removed successfully");
      setTables(tables.filter((t) => t._id !== id));
    } catch (error) {
      toast.error("Error deleting table");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(`${backendUrl}/api/table/toggle/${id}`);
      if (res.data.success) {
        toast.success("Table status updated");
        setTables((prev) =>
          prev.map((t) =>
            t._id === id ? { ...t, status: res.data.table.status } : t
          )
        );
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error toggling status");
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Tables</h2>

      {/* Add Table Form */}
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          placeholder="Table Number"
          className="border px-4 py-2 rounded"
          value={newTable.tableNumber}
          onChange={(e) =>
            setNewTable({ ...newTable, tableNumber: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Capacity"
          className="border px-4 py-2 rounded"
          value={newTable.capacity}
          onChange={(e) =>
            setNewTable({ ...newTable, capacity: e.target.value })
          }
        />
        <button
          onClick={addTable}
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
        >Add Table</button>
      </div>

      {/* Table List */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] font-semibold border-b pb-2 gap-8">
        <span>Table No.</span>
        <span>Capacity</span>
        <span>Status</span>
        <span className="text-center">Toggle</span>       
        <span className="text-center">Action</span>
      </div>

      {tables.map((table) => (
        <div
          key={table._id}
          className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center py-2 border-b gap-8"
        >
          <span>{table.tableNumber}</span>
          <span>{table.capacity}</span>
          <span
            className={`font-semibold ${
              table.status === "Available" ? "text-green-600" : "text-red-600"
            }`}
          >
            {table.status}
          </span>

          <button
            onClick={() => toggleStatus(table._id)}
            className={`px-2 py-1 rounded text-white ${
              table.status === "Available"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {table.status === "Available" ? "Mark Reserved" : "Mark Available"}
          </button>

          <MdDeleteForever
            className="text-red-600 text-2xl cursor-pointer"
            onClick={() => deleteTable(table._id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ListTable;
