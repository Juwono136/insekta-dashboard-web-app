const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="card bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="card-body p-6 flex flex-row items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
