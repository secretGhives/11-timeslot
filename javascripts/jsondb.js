/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*members ajax, async, createRecord, createTable, data, deleteRecords, 
    deleteTable, error, extend, field, func, hasOwnProperty, name, parse, 
    post, push, readRecords, save, selectTable, showTables, stringify, 
    success, sync, type, updateRecords, url, val
*/
/*global $, JSON */
'use strict';
var JSONDB = function (name, sync) {
	var storedData, o, i;
	$.ajax({
		type : 'POST',
		url  : './php/jsondb.php',
		async: false,
		success : function (d) {
			if (d) {
				storedData = JSON.parse(d);
			}
		},
		data : { name : name, func : 'read_file'},
		error : function () { 
			storedData = false;
		}
	});	
	o = {
		name : name,
		sync : sync || false,
		data : {},
		createTable : function (table) {
			var that = this;
			if (!that.data[table]) {
				that.data[table] = (function () {
							var getRecords = function (condition) {
								var d = retObj.data,
									ret = [], 
									i, j;
								if (condition) {
									if (typeof condition === 'string' && d[condition]) {
										ret.push(condition);
									}
									else {
										for (i in d) {
											if (d.hasOwnProperty(i)) {
												for (j in d[i]) {
													if (d.hasOwnProperty(i)) {
														if (j === condition.field && d[i][j] === condition.val) { // if the record has the field
															ret.push(i);
														}
													}
												}	
											}
										}
									}
								}
								else {
									for (i in d) {
										if (d.hasOwnProperty(i)) {
											ret.push(i);
										}
									}
								}
								return ret;
							},
								retObj = {
									data : {},
									createRecord  : function (name, obj) {
										this.data[name] = obj;
										that.save();
										return this;
									},
									readRecords   : function (condition) {
										var rcds = getRecords(condition),
											i, ret = {};
										for (i = 0; rcds[i]; i += 1) {
											ret[rcds[i]] = this.data[rcds[i]];
										}
										return ret;
									},
									updateRecords : function (condition, updated) {  // condition = { field : 'field', val : 'a' }
										var rcds = getRecords(condition), 
											i;
										for (i = 0; rcds[i]; i += 1) {
											$.extend(this.data[rcds[i]], updated); 
										}
										that.save();
										return this;
									},
									deleteRecords  : function (condition) {
										var rcds = getRecords(condition), i;
										for (i = 0; rcds[i]; i += 1) {
											delete this.data[rcds[i]];
										}
										that.save();
										return this;
									}
								};
							return retObj;
						}());
			}
			return this.data[table];
		},
		selectTable : function (table) {
			return this.createTable(table);
		},
		deleteTable : function (table) {
			if (this.data[table]) {
				delete this.data[table];			
				this.save();
			}
			return this;
		},
		showTables : function () {
			var list = [], t;
			for (t in o.data) {
				if (o.data.hasOwnProperty(t)) {
					list.push(t);
				}
			}
			return list;
		},
		save : function save() {
			if (this.sync) {
				var str = JSON.stringify(this.data);	
				$.post('./php/jsondb.php', { name : this.name, data : str, func : 'write_file'});
			}
		}
	};

	if (storedData) {
	
		for (i in storedData) {
			if (storedData.hasOwnProperty(i)) {
				o.createTable(i).data = storedData[i].data;
			}
		}	
	}
	return o;
};
