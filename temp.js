//CONSTANTS

const horizontalOffset = 3

const green = "#b7e1cd"

const lentGreen = "#34a853"

const booksLentCol = 23

const booksReturnedCol = 25

const maxBooksLendable = 20



var ss = SpreadsheetApp.getActiveSpreadsheet();

var formSubmissionSheet = ss.getSheetByName("Books Borrow responses")

var booksListSheet = ss.getSheetByName("Booklist")



// function myvlookup(sheet, startRow, startColumn, index, value) {

//   var lastRow=sheet.getLastRow();

//   var dataRange = sheet.getRange(startRow,startColumn,lastRow,startColumn+index)

//   var data=dataRange.getValues();

//   for(i=0;i<data.length;++i){

//     if (data[i][0]==value){

//       return dataRange.getCell(i + 1, index+1);

//     }

//   }

// }



function generateTimestamp(row, col){

  if(row === 1) return

  var timestampCell = formSubmissionSheet.getRange(row, col + 1)

  timestampCell.setValue(new Date()).setNumberFormat("yyyy-MM-dd HH:mm:ss")

}



function onEditInstallable(e) {

  var sheet = e.range.getSheet().getName()

  if(sheet === "Books Borrow responses"){

    var thisCol = e.range.getColumn();

    var thisRow = e.range.getRow();



    if(thisCol === booksLentCol || thisCol === booksReturnedCol) generateTimestamp(thisRow, thisCol)

    //if(thisCol === 33) markAsLent(thisRow)

    if(thisCol === booksReturnedCol) markAsReturned(thisRow)

  }

  

}



function sendSignal(e){

  var sheet = e.range.getSheet().getName()

  if(sheet === "Booklist"){

    UrlFetchApp.fetchAll(["https://gvh-library-server.herokuapp.com/io", "http://158.247.193.21:8888/io"])

  }

}



function markAsReturned(thisRow){



  var booksList = []

  for(var i = 0; i < maxBooksLendable; i++){

      var cell = formSubmissionSheet.getRange(thisRow, i + horizontalOffset)

      if(cell.getBackground() == lentGreen){

        // Logger.log(cell.getValue())

        booksList.push(cell.getValue())

      }

  }



  var lastRow=booksListSheet.getLastRow();

  var startRow = 2

  var startColumn = 1

  var index = 5

  var dataRange = booksListSheet.getRange(startRow,startColumn,lastRow,startColumn+index)

  var data=dataRange.getValues();



  for(var j=0;j<data.length;++j){



    for(var i = 0; i < booksList.length; i++){

      // Logger.log("DATEA " + data[j])

      var book = booksList[i]

      if (data[j][0]==book){

        // Logger.log(book)

        dataRange.getCell(j + 1, index+1).setValue(1)

        booksList.splice(i, 1)

      }

    }

    

  }

  UrlFetchApp.fetchAll(["https://gvh-library-server.herokuapp.com/io", "http://158.247.193.21:8888/io"])

}



// function markAsLent(thisRow){

//   for(var i = 0; i <= 29; i++){



//     var cell = sheet.getRange(thisRow, i + horizontalOffset)

//     if(cell.getBackground() == green){

//       var bookNumber = cell.getValue()

//       myvlookup(booksListSheet, 2,1,5,bookNumber).setValue(0)

//       cell.setNumberFormat("@")

//       cell.setHorizontalAlignment("right")

//     }



//   }



// }



function getHex(input) {

  return SpreadsheetApp.getActiveSpreadsheet().getRange(input).getBackgrounds();

}
