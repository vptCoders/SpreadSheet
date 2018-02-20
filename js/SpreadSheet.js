"use strict";

function SpreadSheet(parentElement, options) {
	let _containerEl = null;
	let _dataArray = [];
	let _stageContainer = DOMManager.createDiv();
	_stageContainer.classList.add("SpreadSheet--stage_container");

	let _dataContainer = DOMManager.createDiv();
	_dataContainer.classList.add("SpreadSheet--data_container");
	_stageContainer.appendChild(_dataContainer);

	let _selectionManager = null;
	let _dataTables = [];
	let _dataTablesChangedEvent = null;
	let _parentElementChangedEvent = null;
	let _data = null;

	let _horizontalHeadingTables = [];
	let _verticalHeadingTables = [];

	let _defaultOptions = {
		modules: {
			cursor: true,
			resize: true,
			ribbon: true,
			selection: true,
			virtualization: true,
		},

		showHeadings: true,
		numberOfColumns: 80,
		numberOfRows: 100,
	};

	let _userOptions = null;
	let _scrollBarWidth = 0;
	let _scrollBarHeight = 0;



	// 	Private methods:

	function calculateScrollbarDimensions() {
		let _tempScrollContainer = DOMManager.createDiv();
		_tempScrollContainer.classList.add("SpreadSheet--temporary_container");
		document.body.appendChild(_tempScrollContainer);

		let _tempScrollContainerBCR = _tempScrollContainer.getBoundingClientRect();
		_scrollBarWidth = _tempScrollContainerBCR.width - _tempScrollContainer.clientWidth;
		_scrollBarHeight = _tempScrollContainerBCR.height - _tempScrollContainer.clientHeight;

		document.body.removeChild(_tempScrollContainer);
	}


	function parseContainer(containerEl) {
		if(containerEl) {		
			if(containerEl.tagName && containerEl.tagName.toLowerCase() === "div") {
				_containerEl = containerEl;
				_parentElementChangedEvent = new CustomEvent("SpreadSheetParentElementChanged", {
					detail: this, 
				});
				document.dispatchEvent(_parentElementChangedEvent);
				_containerEl.appendChild(_stageContainer);
			} else {
				throw new Error("SpreadSheet objects shall be contained in DIV elements.");
			}
		}

		calculateScrollbarDimensions();
	}
	function createHorizontalHeading() {
		// if querySelector.... not exists....
		let _data = [];
		let _row = [];
		let _columns = _defaultOptions.numberOfColumns;

		for(let _curCol = 1; _curCol <= _columns; _curCol++) {
			let _newCell = {
				textContent: DataManager.convertNumberToColumnName(_curCol),
			}
			_row.push(_newCell);
		}
		_data.push(_row);

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--horizontal_heading_wrapper");
		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		let _cornerHeadingBCR = _cornerHeading.getBoundingClientRect();
		let _widthCalc = _cornerHeadingBCR.width + _scrollBarWidth;
		_wrapper.style.cssText = "width: calc(100% - " + _widthCalc + "px); left: " + _cornerHeadingBCR.width + "px; height: " + _cornerHeadingBCR.height + "px;";

		let _container = DOMManager.createDiv();
		_container.classList.add("SpreadSheet--horizontal_heading_container");


		let isSyncingDataContainer = false;
		let isSyncingContainer = false;

		_dataContainer.addEventListener("scroll", function(evt) {
			if (!isSyncingDataContainer) {
				isSyncingContainer = true;
				_container.scrollLeft = this.scrollLeft;
			}

			isSyncingDataContainer = false;
		});

		_container.onscroll = function() {
			if (!isSyncingContainer) {
				isSyncingDataContainer = true;
				_dataContainer.scrollLeft = this.scrollLeft;
			}

			isSyncingContainer = false;
		}

		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--horizontal_heading_table");
		_headingTable.style.cssText = "height: " + _cornerHeadingBCR.height + "px";

		let _useCustomCursor = _defaultOptions.modules.cursor;
		if(_useCustomCursor) {
			_headingTable.classList.add("SpreadSheet--horizontal_heading_table_cursor");
		}

		for(let _curCol = 0; _curCol < _columns; _curCol++) {
			let clickCallback = this.selectColumns.bind(this, _curCol);
			_headingTable.children[0].children[_curCol].addEventListener("click", clickCallback);
		}

		_horizontalHeadingTables.push(_headingTable);
		_container.appendChild(_headingTable);
		_wrapper.appendChild(_container);
		_stageContainer.appendChild(_wrapper);
	}
	function createVerticalHeading() {
		// if querySelector.... not exists....
		let _data = [];
		let _columns = 1;
		let _rows = _defaultOptions.numberOfRows;

		for(let _curRow = 1; _curRow <= _rows; _curRow++) {
			let _row = [];
			let _newCell = {
				textContent: _curRow,
			}
			_row.push(_newCell);
			_data.push(_row);
		}



		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--vertical_heading_wrapper");
		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		let _cornerHeadingBCR = _cornerHeading.getBoundingClientRect();
		let _heightCalc = _cornerHeadingBCR.height + _scrollBarHeight;
		_wrapper.style.cssText = "height: calc(100% - " + _heightCalc + "px); width: " + _cornerHeadingBCR.width + "px; top: " + _cornerHeadingBCR.height + "px";

		let _container = DOMManager.createDiv();
		_container.classList.add("SpreadSheet--vertical_heading_container");

		let isSyncingDataContainer = false;
		let isSyncingContainer = false;

		_dataContainer.addEventListener("scroll", function(evt) {
			if (!isSyncingDataContainer) {
				isSyncingContainer = true;
				_container.scrollTop = this.scrollTop;
			}

			isSyncingDataContainer = false;
		});

		_container.onscroll = function() {
			if (!isSyncingContainer) {
				isSyncingDataContainer = true;
				_dataContainer.scrollTop = this.scrollTop;
			}

			isSyncingContainer = false;
		}

		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--vertical_heading_table");
		_headingTable.style.cssText = "width: " + _cornerHeadingBCR.width + "px";

		let _useCustomCursor = _defaultOptions.modules.cursor;
		if(_useCustomCursor) {
			_headingTable.classList.add("SpreadSheet--vertical_heading_table_cursor");
		}


		_container.appendChild(_headingTable);
		_wrapper.appendChild(_container);
		_stageContainer.appendChild(_wrapper);
	}
	function createCornerHeading() {
		let _data = [];
		let _row = [];
		let _cell = {
			textContent: "network_cell",
		}
		_row.push(_cell);
		_data.push(_row);

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--corner_heading_wrapper");

		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--corner_heading_table");

		_wrapper.appendChild(_headingTable);
		_stageContainer.appendChild(_wrapper);
	}
	function createHeadings() {
		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		if(!_cornerHeading) {
			createCornerHeading.call(this);
		}

		let _horzHeading = _stageContainer.querySelector(".SpreadSheet--horizontal_heading_wrapper");
		if(!_horzHeading) {
			createHorizontalHeading.call(this);
		}

		let _vertHeading = _stageContainer.querySelector(".SpreadSheet--vertical_heading_wrapper");
		if(!_vertHeading) {
			createVerticalHeading.call(this);
		}
	}
	function getHorizontalHeadingTable(columnIndex) {
		// if frozen columns, different...
		return _horizontalHeadingTables[0];
	}







	// 	Constructor code:
	function SpreadSheet(parentElement, options) {
		parseContainer.call(this, parentElement);
		_userOptions = options;
		
		this.setSelectionModule();
	}
	SpreadSheet.prototype = Object.create(this.constructor.prototype);
	SpreadSheet.prototype.constructor = SpreadSheet;

	// 	Properties setters/getters:
	Object.defineProperty(SpreadSheet.prototype, 'parentElement', {
		get: function() { 
			return _containerEl;
		},
		set: function(newContainerEl) {
			parseContainer.call(this, newContainerEl);
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'dataContainer', {
		get: function() { 
			return _dataContainer;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'dataTables', {
		get: function() { 
			return _dataTables;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'stage', {
		get: function() { 
			return _stageContainer;
		}
	});


	SpreadSheet.prototype.createEmptySheet = function() {
		createHeadings.call(this);

		let _numberOfColumns = _defaultOptions.numberOfColumns;
		let _numberOfRows = _defaultOptions.numberOfRows;
		let _rows = {
			header: 1,
			body: _numberOfRows - 1,
		};

		_data = [];
		for(let i = 0; i < _numberOfRows; i++) {
			let newRowData = {
				rowData: [],
			};
			for(let j = 0; j < _numberOfColumns; j++) {
				let newCellData = {};
				newRowData.rowData.push(newCellData);
			}
			_data.push(newRowData);
		}

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--left_data_table_wrapper");
		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		if(_cornerHeading) {
			let _cornerHeadingBCR = _cornerHeading.getBoundingClientRect();
			_wrapper.style.cssText = "left: " + _cornerHeadingBCR.width + "px; top: " + _cornerHeadingBCR.height + "px";
		}

		let _table = DOMManager.createEmptyTable(_rows, _numberOfColumns);
		_table.classList.add("SpreadSheet--table");
		_table.classList.add("SpreadSheet--data_table");
		_dataTables.push(_table);

		_dataTablesChangedEvent = new CustomEvent('dataTablesChanged', {
			detail: this, 
		});
		document.dispatchEvent(_dataTablesChangedEvent);

		_wrapper.appendChild(_table);
		_dataContainer.appendChild(_wrapper);
	}


	SpreadSheet.prototype.createSheetFromData = function(data) {
		createVerticalHeading();
		createHorizontalHeading();
		createCornerHeading();

		_data = data;
		let _table = DOMManager.createTableFromData(_data);
		_table.classList.add("SpreadSheet--table");
		_table.classList.add("SpreadSheet--data_table");

		let _container = DOMManager.createDiv();
		_container.style.cssText = "width: 3650px; height: 1030px; position: relative; left: 23px; top: 21px; overflow: hidden";

		_dataTables.push(_table);

		_dataTablesChangedEvent = new CustomEvent('dataTablesChanged', {
			detail: this, 
		});
		document.dispatchEvent(_dataTablesChangedEvent);

		_container.appendChild(_table);
		_dataContainer.insertBefore(_container, _dataContainer.children[0]);

		// _dataContainer.appendChild(_container);
	}







	SpreadSheet.prototype.selectColumns = function(columnsIndexes) {
		let _selectedColumnSyle = "SpreadSheet--horizontal_heading_column_selected";
		let _selectedColumns = _stageContainer.querySelectorAll("." + _selectedColumnSyle);
		if(_selectedColumns && _selectedColumns.length) {
			let _numberOfSelectedColumns = _selectedColumns.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedColumns; _curCol++) {
				_selectedColumns[_curCol].classList.remove(_selectedColumnSyle);
			}
		}

		if(columnsIndexes.constructor === Array) {
			let _numberOfColumns = columnsIndexes.length;
			for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
				let _horzHeadingTable = getHorizontalHeadingTable(columnsIndexes[_curCol]);
				_selectionManager.selectColumn(columnsIndexes[_curCol], _horzHeadingTable, _selectedColumnSyle);
			}
		} else if(Number.isInteger(columnsIndexes)) {
			let _horzHeadingTable = getHorizontalHeadingTable(columnsIndexes);
			_selectionManager.selectColumn(columnsIndexes, _horzHeadingTable, _selectedColumnSyle);
		} else {
			throw new Error("Cannot select the specified columns.");
		}
	}

	SpreadSheet.prototype.selectCell = function(cellIndexes) {
		let _selectedCellHorizontalHeadingSyle = "SpreadSheet--horizontal_heading_cell_selected";
		let _horzHeadingTable = _stageContainer.querySelector(".SpreadSheet--horizontal_heading_table");
		if(_horzHeadingTable) {
			_horzHeadingTable.children[0].children[cellIndexes.column].classList.add(_selectedCellHorizontalHeadingSyle);
		}

		let _selectedCellVerticalHeadingSyle = "SpreadSheet--vertical_heading_cell_selected";
		let _vertHeadingTable = _stageContainer.querySelector(".SpreadSheet--vertical_heading_table");
		if(_vertHeadingTable) {
			_vertHeadingTable.children[cellIndexes.row].children[0].classList.add(_selectedCellVerticalHeadingSyle);
		}

		// _selectionManager.selectCell(cellIndexes.row, cellIndexes.column, _dataTables[0], "thead");
	}

	SpreadSheet.prototype.selectRange = function(range) {
		/*
			range = {
				firstCellRow:
				firstCellColumn:
				lastCellRow:
				lastCellColumn:
			}
		*/
	}


	SpreadSheet.prototype.clearSelection = function() {
		/*	Clear selected cells styling*/
		let _selectedColumnSyle = "SpreadSheet--horizontal_heading_column_selected";
		let _selectedColumns = _stageContainer.querySelectorAll("." + _selectedColumnSyle);
		if(_selectedColumns && _selectedColumns.length) {
			let _numberOfSelectedColumns = _selectedColumns.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedColumns; _curCol++) {
				_selectedColumns[_curCol].classList.remove(_selectedColumnSyle);
			}
		}

		let _selectedCellHorizontalHeadingSyle = "SpreadSheet--horizontal_heading_cell_selected";
		let _selectedCellsHorizontalHeading = _stageContainer.querySelectorAll("." + _selectedCellHorizontalHeadingSyle);
		if(_selectedCellsHorizontalHeading && _selectedCellsHorizontalHeading.length) {
			let _numberOfSelectedCells = _selectedCellsHorizontalHeading.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedCells; _curCol++) {
				_selectedCellsHorizontalHeading[_curCol].classList.remove(_selectedCellHorizontalHeadingSyle);
			}
		}

		let _selectedCellVerticalHeadingSyle = "SpreadSheet--vertical_heading_cell_selected";
		let _selectedCellsVerticalHeading = _stageContainer.querySelectorAll("." + _selectedCellVerticalHeadingSyle);
		if(_selectedCellsVerticalHeading && _selectedCellsVerticalHeading.length) {
			let _numberOfSelectedCells = _selectedCellsVerticalHeading.length;
			for(let _curRow = 0; _curRow < _numberOfSelectedCells; _curRow++) {
				_selectedCellsVerticalHeading[_curRow].classList.remove(_selectedCellVerticalHeadingSyle);
			}
		}
	}





	SpreadSheet.prototype.getIndexes = function(cell) {
		// if frozen columns, different....

		let indexes = {
			row: 0,
			column: 0,
		};

/*		let _table = null;
		if(	cell.parentElement.parentElement && cell.parentElement.parentElement.tagName &&
			cell.parentElement.parentElement.tagName.toLowerCase() === "table") {
				_table = cell.parentElement.parentElement;
		} else if(	cell.parentElement.parentElement.parentElement && cell.parentElement.parentElement.parentElement.tagName &&
					cell.parentElement.parentElement.parentElement.tagName.toLowerCase() === "table") {
						_table = cell.parentElement.parentElement.parentElement;
		} else {
			throw new Error("Cannot");
		}*/


		for(let _curCol = 0; _curCol < cell.parentElement.children.length; _curCol++) {
			if(cell.parentElement.children[_curCol] === cell) {
				indexes.column = _curCol;
			}
		}

		for(let _curRow = 0; _curRow < cell.parentElement.parentElement.children.length; _curRow++) {
			if(cell.parentElement.parentElement.children[_curRow] === cell.parentElement) {
				indexes.row = _curRow;
			}
		}


		if(	cell.parentElement.parentElement && cell.parentElement.parentElement.tagName &&
			cell.parentElement.parentElement.tagName.toLowerCase() === "tbody") {
				let _hasHeader = cell.parentElement.parentElement.parentElement.getElementsByTagName("thead")[0];
				if(_hasHeader) {
					indexes.row += cell.parentElement.parentElement.parentElement.getElementsByTagName("thead")[0].children.length;
				}
		}

		return indexes;
	}
 


	





	SpreadSheet.prototype.setSelectionModule = function() {
		let _useModule = (_userOptions && 'modules' in _userOptions && 'selection' in _userOptions.modules) ? 
							_userOptions.modules.selection : _defaultOptions.modules.selection;
		if(_useModule) {
			_selectionManager = new SelectedCellsManager(this);
		}
	}

	return new SpreadSheet(parentElement, options);
}


























let DataManager = {
	countColumns: function(data) {
		let _numberOfColumns = 0;
		let _maxNumberOfColumns = 0;
		if(data.constructor === Array && data.length > 0) {
			for(let _curRow = 0; _curRow < data.length; _curRow++) {
				_numberOfColumns = 0;
				if(data[_curRow].constructor === Array) {
					for(let _curCol = 0; _curCol < data[_curRow].length; _curCol++) {
						_numberOfColumns += 1;
						if('colspan' in data[_curRow][_curCol] && Number.isInteger(data[_curRow][_curCol].colspan)) {
							_numberOfColumns += data[_curRow][_curCol].colspan - 1;
						}
					}
				} else if(data[_curRow].constructor === Object && 'rowData' in data[_curRow]) {
					for(let _curCol = 0; _curCol < data[_curRow].rowData.length; _curCol++) {
						_numberOfColumns += 1;
						if('colspan' in data[_curRow].rowData[_curCol] && Number.isInteger(data[_curRow].rowData[_curCol].colspan)) {
							_numberOfColumns += data[_curRow].rowData[_curCol].colspan - 1;
						}
					}
				}

				if(_numberOfColumns > _maxNumberOfColumns) {
					_maxNumberOfColumns = _numberOfColumns;
				}
			}
		}

		return _maxNumberOfColumns;
	},

	convertNumberToColumnName: function(value) {
		let _columnName = "";
		for(let a = 1, b = 26; (value -= a) >= 0; a = b, b *= 26) {
			_columnName = String.fromCharCode(parseInt((value % b) / a) + 65) + _columnName;
		}
		
		return _columnName;
	}
};




































let DOMManager = {
	createDiv: function() {
		let _div = document.createElement("div");
		return _div;
	},


	createTableFromData: function(data) {
		/*
			data = {
				thead: [rowDataObj],
				tbody: [rowDataObj],
				tfoot: [rowDataObj],
			};
			OR
			data = [rowDataObj],
			rowDataObj = {
				height: 10,
				style: cssText,
				rowData: [cellDataObj],
			};
			or
			rowDataObj = [cellDataObj],
			cellDataObj = {
				textContent: 'text', ???
				innerHTML: '<b>me',
				colspan: 2,
				style: cssText,
			}
		*/

		if(!data) {
			throw new Error("Cannot create a table without data.");
		}



		let _table = document.createElement("table");
		let _numberOfColumns = DataManager.countColumns(data);
		let _createdColumns = 0;

		if(data.constructor === Array) {
			let _numberOfRows = data.length;
			for(let _curRow = 0; _curRow < _numberOfRows; _curRow++) {
				let _newRow = document.createElement("tr");
				_createdColumns = 0;
				if(data[_curRow].constructor === Array) {
					for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
						if(_createdColumns > _numberOfColumns) {
							continue;
						}
						let _newCell = null;
						if(_curRow === 0) {
							_newCell = document.createElement("th");
						} else {
							_newCell = document.createElement("td");
						}

						if(data[_curRow][_curCol]) {
							_newCell.textContent = data[_curRow][_curCol].textContent;
							if('colspan' in data[_curRow][_curCol] && Number.isInteger(data[_curRow][_curCol].colspan)) {
								_newCell.colSpan = data[_curRow][_curCol].colspan.toString();
								_createdColumns += data[_curRow][_curCol].colspan;
							}
						} else {
							_newCell.textContent = "";
						}

						_newRow.appendChild(_newCell);
						_createdColumns += 1;

					}
				} else if(data[_curRow].constructor === Object && 'rowData' in data[_curRow]) {
					for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
						if(_createdColumns > _numberOfColumns) {
							continue;
						}
						let _newCell = null;
						if(_curRow === 0) {
							_newCell = document.createElement("th");
						} else {
							_newCell = document.createElement("td");
						}

						if(data[_curRow].rowData[_curCol]) {
							_newCell.textContent = data[_curRow].rowData[_curCol].textContent;
							if('colspan' in data[_curRow].rowData[_curCol] && Number.isInteger(data[_curRow].rowData[_curCol].colspan)) {
								_newCell.colSpan = data[_curRow].rowData[_curCol].colspan.toString();
								_createdColumns += data[_curRow].rowData[_curCol].colspan;
							}
						} else {
							_newCell.textContent = "";
						}

						_newRow.appendChild(_newCell);
						_createdColumns += 1;
					}
				}
				_table.appendChild(_newRow);
			}
		}

		return _table;
	},

	createEmptyTable: function(rows, columns) {
		/*
			rows:
				- integer
				- object: {
					[header]: integer,
					[body]: integer,
					[footer]: integer,
				}
			columns:
				- integer
		*/


		if(!Number.isInteger(columns) || columns < 1) {
			throw new Error("The number of columns needs to be a positive integer number.");
		}


		if(!Number.isInteger(rows) && !(rows.constructor === Object)) {
			throw new Error("The number of rows needs to be defined as a positive integer number or as a rowsObject.");
		} else if(Number.isInteger(rows) && rows < 0) {
			throw new Error("The number of rows needs to be a positive integer number.");
		}

		let _createHeader = (rows.constructor === Object && 'header' in rows) ? true : false;
		let _createBody = (rows.constructor === Object && 'body' in rows) ? true : false;


		let _table = document.createElement("table");
		if(Number.isInteger(rows)) {
			let _tableCells = createCellsArray(rows, columns);
			_table.appendChild(_tableCells);
		} else {
			let _tableHeader = _createHeader ? document.createElement("thead") : null;
			let _tableBody = _createBody ? document.createElement("tbody") : null;
			if(_createHeader) {
				if(Number.isInteger(rows.header) && rows.header >= 0) {
					let _headerCells = createCellsArray(rows.header, columns, true);
					_tableHeader.appendChild(_headerCells);
					_table.appendChild(_tableHeader);
				} else {
					throw new Error("The number of rows of the table header needs to be a positive integer number.");
				}
			}

			if(_createBody) {
				if(Number.isInteger(rows.body) && rows.body >= 0) {
					let _bodyCells = createCellsArray(rows.body, columns);
					_tableBody.appendChild(_bodyCells);
					_table.appendChild(_tableBody);
				} else {
					throw new Error("The number of rows of the table body needs to be a positive integer number.");
				}
			}
		}



		function createCellsArray(numberOfRows, numberOfColumns, thCells) {
			let _fragment = document.createDocumentFragment();

			for(let _curRow = 0; _curRow < numberOfRows; _curRow++) {
				let _row = document.createElement("tr");

				for(let _curCol = 0; _curCol < numberOfColumns; _curCol++) {
					let _cell = thCells ? document.createElement("th") : document.createElement("td");
					_row.appendChild(_cell);
				}

				_fragment.appendChild(_row);
			}
			return _fragment;
		}

		return _table;
	},
};


























function MouseTarget(targetElement) {
	// 	Private properties:
	let _targetElement = null;
	let _targetElementBCR = null;

	// 	Private methods:
	function parseTargetElement(targetEl) {
		if(targetEl) {
			_targetElement = targetEl;
			_targetElementBCR = _targetElement.getBoundingClientRect();
		}
	}

	// 	Constructor code:
	function MouseTarget(targetElement) {
		parseTargetElement(targetElement);
	}
	MouseTarget.prototype = Object.create(this.constructor.prototype);
	MouseTarget.prototype.constructor = MouseTarget;

	// 	Properties setters/getters:
	Object.defineProperty(MouseTarget.prototype, 'x', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.x : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'y', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.y : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'width', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.width : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'height', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.height : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'target', {
		get: function() { 
			return _targetElement ? _targetElement : null; 
		},
		set: function(newTarget) {
			parseTargetElement(newTarget);
		}
	});
	Object.defineProperty(MouseTarget.prototype, 'top', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.top : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'bottom', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.bottom : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'left', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.left : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'right', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.right : null; 
		},
	});

	return new MouseTarget(targetElement);
}












function SelectedCellsManager(SpreadSheet) {
	// 	Private properties:
	let _mouseDownTarget = new MouseTarget();
	let _mouseUpTarget = new MouseTarget();
	let _dataContainerInitialScrollTop = 0;
	let _dataContainerInitialScrollLeft = 0;
	let _windowInitialScrollTop = 0;
	let _windowInitialScrollLeft = 0;
	let _validSelection = false;
	let _updateHighlighterCallback = null;
	let _cellsHighlighter = document.createElement("div");
	_cellsHighlighter.classList.add("SpreadSheet--cells_highlighter");

	// 	Private methods:
	function isValidSpreadSheet() {
		if('dataContainer' in SpreadSheet) {
			return true;
		} else {
			return false;
		}
	}

	function setCellSelectionEvents(dataTables) {
		let _qtyDataTables = 0;
		if(dataTables && dataTables.constructor === Array) {
			_qtyDataTables = dataTables.length;
		}
		for(let _curTable = 0; _curTable < _qtyDataTables; _curTable++) {
			let mouseDownCallback = mouseEventCallback.bind(null, _mouseDownTarget, startUpdatingHighlighter);
			dataTables[_curTable].addEventListener("mousedown", mouseDownCallback);

			let mouseUpCallback = mouseEventCallback.bind(null, _mouseUpTarget, resetHighlighter);
			dataTables[_curTable].addEventListener("mouseup", mouseUpCallback);
		}
	}

	function startUpdatingHighlighter() {
		if(_validSelection) {
			return;
		}
		SpreadSheet.clearSelection();
		_validSelection = true;
		_dataContainerInitialScrollTop = SpreadSheet.dataContainer.scrollTop;
		_dataContainerInitialScrollLeft = SpreadSheet.dataContainer.scrollLeft;
		_windowInitialScrollTop = window.scrollY;
		_windowInitialScrollLeft = window.scrollX;
		
		_updateHighlighterCallback = mouseEventCallback.bind(null, _mouseUpTarget, redrawHighlighter);
		document.addEventListener("mousemove", _updateHighlighterCallback);

		// shall add document.addeventlistener "mouseup", to clean if the user moused up outside the table
		document.addEventListener("mouseup", resetHighlighter);
	}

	function resetHighlighter(evt) {
		if(_validSelection) {
			redrawHighlighter();
		}
		document.removeEventListener("mousemove", _updateHighlighterCallback);
		document.removeEventListener("mouseup", resetHighlighter);
		_validSelection = false;
	}

	function mouseEventCallback(mouseTarget, eventCallback, evt) {
		evt.preventDefault();
		evt.stopPropagation();
		let _validTable = false;
		if(	evt.target && evt.target.tagName && 
		   (evt.target.tagName.toLowerCase() === "td" || 
			evt.target.tagName.toLowerCase() === "th")) {

			for(let _curTable = 0; _curTable < SpreadSheet.dataTables.length; _curTable++) {
				if(	evt.target.parentElement.parentElement === SpreadSheet.dataTables[_curTable] ||
					evt.target.parentElement.parentElement.parentElement === SpreadSheet.dataTables[_curTable]) {
					_validTable = true;
				}
			}

			// if(evt.target.parentElement.parentElement)

			if(evt.button === 0 && _validTable) {
				//	Valid target cell. Save it. 
				mouseTarget.target = evt.target;
				if(eventCallback) {
					eventCallback(evt);
				}
			}
		}
	}

	function redrawHighlighter() {
		setTimeout(function() {
			

			SpreadSheet.selectCell(SpreadSheet.getIndexes(_mouseUpTarget.target));
			let mouseDownTargetIndexes = SpreadSheet.getIndexes(_mouseDownTarget.target);
			let mouseUpTargetIndexes = SpreadSheet.getIndexes(_mouseUpTarget.target);
			let additionalTopOffset = 0;
			let additionalLeftOffset = 0;
			if(mouseUpTargetIndexes.row === 0 || mouseDownTargetIndexes.row === 0) {
				additionalTopOffset = -1;
			}

			if(mouseUpTargetIndexes.column === 0 || mouseDownTargetIndexes.column === 0) {
				additionalLeftOffset = -1;
			}






			let _containerBCR = SpreadSheet.dataContainer.getBoundingClientRect();
			let mouseDownTargetYPos = _mouseDownTarget.y + _windowInitialScrollTop - window.scrollY + _dataContainerInitialScrollTop;
			let mouseDownTargetXPos = _mouseDownTarget.x + _windowInitialScrollLeft - window.scrollX + _dataContainerInitialScrollLeft;
			let mouseUpTargetYPos = _mouseUpTarget.y + SpreadSheet.dataContainer.scrollTop;
			let mouseUpTargetXPos = _mouseUpTarget.x + SpreadSheet.dataContainer.scrollLeft;

			let leftTarget = (mouseDownTargetXPos < mouseUpTargetXPos) ? _mouseDownTarget : _mouseUpTarget;
			let rightTarget = (leftTarget === _mouseDownTarget) ? _mouseUpTarget : _mouseDownTarget;
			let topTarget = (mouseDownTargetYPos < mouseUpTargetYPos) ? _mouseDownTarget : _mouseUpTarget;
			let bottomTarget = (topTarget === _mouseUpTarget) ? _mouseDownTarget : _mouseUpTarget;
			
			let leftOffset = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTargetXPos : mouseUpTargetXPos;
			leftOffset -= _containerBCR.x + 1;
			leftOffset += additionalLeftOffset;
			let widthCalc = Math.abs(mouseUpTargetXPos - mouseDownTargetXPos) + 3 + rightTarget.width - additionalLeftOffset;
			let topOffset = (mouseDownTargetYPos < mouseUpTargetYPos) ? mouseDownTargetYPos : mouseUpTargetYPos;
			topOffset -= _containerBCR.y + 1;
			topOffset += additionalTopOffset;
			let heightCalc = Math.abs(mouseUpTargetYPos - mouseDownTargetYPos) + 3 + bottomTarget.height - additionalTopOffset;
			_cellsHighlighter.style.cssText += 	"width: " + widthCalc + "px; " + 
												"height: " + heightCalc + "px; " +
												"left: " + leftOffset + "px; " +
												"top: " + topOffset + "px; " +
												"visibility: visible";
		}, 0);
	}

	// 	Constructor code:
	function SelectedCellsManager(SpreadSheet) {
		if(isValidSpreadSheet(SpreadSheet)) {
			SpreadSheet.dataContainer.appendChild(_cellsHighlighter);
			
			document.addEventListener('dataTablesChanged', function(evt) {
				if(evt.detail === SpreadSheet) {
					setCellSelectionEvents(SpreadSheet.dataTables);
				}
			});
		}
	}
	SelectedCellsManager.prototype = Object.create(this.constructor.prototype);
	SelectedCellsManager.prototype.constructor = SelectedCellsManager;


	SelectedCellsManager.prototype.selectColumn = function(columnIndex, table, selectedStyleClass) {
		let _containerBCR = SpreadSheet.dataContainer.getBoundingClientRect();
		let _columnBCR = table.children[0].children[columnIndex].getBoundingClientRect();

		let leftOffset;
		let widthCalc;
		let topOffset;
		let heightCalc;

		let _selectedColumns = SpreadSheet.stage.querySelectorAll("." + selectedStyleClass);
		if(_selectedColumns && _selectedColumns.length) {
			let _curHighlighterBCR= _cellsHighlighter.getBoundingClientRect();
			leftOffset = _curHighlighterBCR.x - _containerBCR.x;
			widthCalc = _curHighlighterBCR.width + _columnBCR.width;
		} else {
			leftOffset = _columnBCR.left - _containerBCR.x - 1 + SpreadSheet.dataContainer.scrollLeft;
			widthCalc = _columnBCR.width + 3;
		}

		topOffset = _columnBCR.y + _columnBCR.height - _containerBCR.y;
		heightCalc = _containerBCR.height - _columnBCR.height;


		_cellsHighlighter.style.cssText += 	"width: " + widthCalc + "px; " + 
											"height: " + heightCalc + "px; " +
											"left: " + leftOffset + "px; " +
											"top: " + topOffset + "px; " +
											"visibility: visible";

		table.children[0].children[columnIndex].classList.add(selectedStyleClass);
	}


	SelectedCellsManager.prototype.selectCell = function(rowIndex, columnIndex, table, tableLocation) {
		let _containerBCR = SpreadSheet.dataContainer.getBoundingClientRect();
		let _cellBCR = null;
		if(table.getElementsByTagName("thead")[0] || table.getElementsByTagName("tbody")) {
			if(tableLocation) {
				_cellBCR = table.getElementsByTagName(tableLocation)[0].children[rowIndex].children[columnIndex].getBoundingClientRect();
			} else {
				throw new Error("Need to define the table location.");
			}
		} else {
			_cellBCR = table.children[rowIndex].children[columnIndex].getBoundingClientRect();
		}

		let additionalTopOffset = 0;
		let additionalLeftOffset = 0;
		if(rowIndex === 0) {
			additionalTopOffset = -1;
		}

		if(columnIndex === 0) {
			additionalLeftOffset = -1;
		}

		let leftOffset = _cellBCR.left - _containerBCR.x - 1 + SpreadSheet.dataContainer.scrollLeft + additionalLeftOffset;
		let widthCalc = _cellBCR.width + 3 - additionalLeftOffset;
		let topOffset = _cellBCR.y - _containerBCR.y + additionalTopOffset - 1;
		let heightCalc = _cellBCR.height - additionalTopOffset + 3;


		_cellsHighlighter.style.cssText += 	"width: " + widthCalc + "px; " + 
											"height: " + heightCalc + "px; " +
											"left: " + leftOffset + "px; " +
											"top: " + topOffset + "px; " +
											"visibility: visible";
	}

	return new SelectedCellsManager(SpreadSheet);
}