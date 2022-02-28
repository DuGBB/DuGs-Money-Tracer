let db;

const request = indexedDB.open("dugs_money_tracer", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("dugs_money_tracer", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["dugs_money_tracer"], "readwrite");
  const moneyObjectStore = transaction.objectStore("dugs_money_tracer");
  moneyObjectStore.add(record);
}

function uploadTransaction() {
  //   const transactionOnline = db.transaction(["new_funds"], "readwrite");
  //   const moneyObjectStore = transactionOnline.objectStore("new_funds");
  const transactionOnline = db.transaction(["dugs_money_tracer"], "readwrite");
  const moneyObjectStore = transactionOnline.objectStore("dugs_money_tracer");
  const getAll = moneyObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application.json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          //   const transaction = db.transaction(["new_funds"], "readwrite");
          //   const moneyObjectStore = transaction.objectStore("new_funds");

          const transaction = db.transaction(
            ["dugs_money_tracer"],
            "readwrite"
          );
          const moneyObjectStore = transaction.objectStore("dugs_money_tracer");
          moneyObjectStore.clear();

          alert("All saved money transactions have been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadTransaction);
