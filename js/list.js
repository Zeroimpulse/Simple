

var list = {};
list.indexedDB = {};

list.indexedDB.db = null;

list.indexedDB.open = function() {
    var version = 1;
    var request = indexedDB.open("items", version);
    
    //versionchange transaction
    request.onupgradeneeded = function(e) {
        var db = e.target.result;
        
        e.target.transaction.onerror = list.indexedDB.onerror;
        
        if (db.objectStoreNames.contains("item")) {
            db.deleteObjectStore("item");   
        }
        
        var store = db.createObjectStore("item", {keyPath: "timeStamp"});
    };
    
    request.onsuccess = function(e) {
        list.indexedDB.db = e.target.result;   
        list.indexedDB.getAllTodoItems();
    };
    
    request.onerror = list.indexedDB.onerror;
};

list.indexedDB.addItem = function(itemText) {
    var db = list.indexedDB.db;
    var trans = db.transaction(["item"], "readwrite");
    var store = trans.objectStore("item");
    var request = store.put({ 
        "text": itemText,
        "timeStamp": new Date().getTime()
    });
    
    request.onsuccess = function(e) {
        list.indexedDB.getAllTodoItems();
    };
    
    request.onerror = function(e) {
        console.log(e.value);   
    };
};

list.indexedDB.getAllTodoItems = function() {
    var items = document.getElementById("listItems");
    items.innerHTML = "";
    
    var db = list.indexedDB.db;
    var trans = db.transaction(["item"], "readwrite");
    var store = trans.objectStore("item");
    
    //everything in store
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false) 
            return;
          
        renderItem(result.value);
        result.continue();
    };
    
    cursorRequest.onerror = list.indexedDB.onerror;
    
};

function renderItem(row) {
    var items = document.getElementById("listItems");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var t = document.createTextNode(row.text);
    t.data = row.text;
    
    a.addEventListener("click", function(e) {
        list.indexedDB.deleteItem(row.timeStamp);   
    }, false);
    
    a.textContent = " [Delete]";
    li.appendChild(t);
    li.appendChild(a);
    items.appendChild(li);
};

list.indexedDB.deleteItem = function(id) {
    var db = list.indexedDB.db;
    var trans = db.transaction(["item"], "readwrite");
    var store = trans.objectStore("item");
    
    var request = store.delete(id);
    
    request.onsuccess = function(e) {
        list.indexedDB.getAllTodoItems();   
    };
    
    request.onerror = function(e) {
        console.log(e);   
    };
};

function init() {
    list.indexedDB.open();   
}

window.addEventListener("DOMContentLoaded", init, false);

function addItem() {
    var item = document.getElementById('item');
    
    list.indexedDB.addItem(item.value);
    item.value = '';
}

