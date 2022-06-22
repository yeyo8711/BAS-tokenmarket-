import React from "react";

const Leftnav = ({ bananaTokens, setFilterFrom, setFilterTo }) => {
  const clearState = () => {
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";
    setFilterFrom(null);
    setFilterTo(null);
  };

  return (
    <div className="leftnav-main">
      <div className="myinfo">
        <h2>My Tokens</h2>
        <h4>Bananas: {bananaTokens}</h4>
        <h4>Rocks:</h4>
        <h4>Essense:</h4>
        <h4>MBJ:</h4>
      </div>
      <div className="filters">
        <div className="filter-checks">
          Filter By Type
          <label>
            <div className="checkbox">
              <input type="checkbox" />
              Bananas
            </div>
            <div className="checkbox">
              <input type="checkbox" />
              Rocks
            </div>
            <div className="checkbox">
              <input type="checkbox" />
              Essence
            </div>
            <div className="checkbox">
              <input type="checkbox" />
              Berry Juice
            </div>
          </label>
        </div>
      </div>
      <div className="filters">
        <div className="filter-amount">
          Filter By Amount
          <label className="filter-label">
            <div className="filters-container">
              From
              <input
                id="filterFrom"
                className="filter-range"
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </div>
            <div className="filters-container">
              To
              <input
                id="filterTo"
                className="filter-range"
                onChange={(e) => setFilterTo(e.target.value)}
              />
            </div>
            <button onClick={clearState}>Clear</button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Leftnav;
