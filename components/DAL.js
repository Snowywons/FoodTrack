import * as SQLite from 'expo-sqlite';

export default class DB {
	constructor() {
		this.db = SQLite.openDatabase("db.db");
	}

	createTable() {
		this.db.transaction(tx => {
			tx.executeSql("CREATE TABLE IF NOT EXISTS Favorites (id INTEGER PRIMARY KEY NOT NULL, name TEXT);", [],
				(_, result) => {
					console.log("Table Favorites created");
				},
				(err) => console.log("No table created"));
		});
	};

	dropTable(args) {
		this.db.transaction(tx => {
			tx.executeSql("DROP TABLE IF EXISTS ?;", args,
				(_, result) => {
					console.log("Table dropped");
				},
				(err) => console.log("No table dropped"));
		});
	}

	insertTable(args) {
		this.db.transaction(tx => {
			tx.executeSql("INSERT INTO Favorites (id, name) VALUES (?, ?) ", args,
				(_, result) => {
					console.log("Data inserted");
				},
				(err) => console.log("No data inserted"));
		});
	};

	updateTable(args) {
		this.db.transaction(tx => {
			tx.executeSql("UPDATE Favorites SET name=? WHERE id=?", args,
				(_, result) => {
					console.log("Data updated");
				},
				(err) => console.log("No data updated"));
		});
	};

	deleteTable(args) {
		this.db.transaction(tx => {
			tx.executeSql("DELETE FROM Favorites WHERE id=?", args,
				(_, result) => {
					console.log("Data deleted");
				},
				(err) => console.log("No data deleted"));
		});
	};
}
