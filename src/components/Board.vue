<template>
    <div>
        <table class="sudoku" cellpadding="0" cellspacing="0" v-bind:class="{'success': valid }">
            <tr v-for="row in rows" v-bind:class="{ 'bottom-border' : !(row % 3) }" v-bind:key="row">
                <td v-for="column in columns"
                    v-bind:key="column"
                    v-bind:class="{'right-border' : !(column % 3)}">
                <template v-if="ready">
                    <template v-if="isVisible(row-1, column-1)">
                        {{workingSolution[row-1][column-1]}}
                    </template>
                    <template v-else>
                            <input type="text" maxlength="1" v-model="workingSolution[row-1][column-1]" :readonly="valid" />
                    </template>
                </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import Timer from './Timer.vue';

const MaxNumberOfErrorsException = {};

@Component
export default class Board extends Vue {
    private get valid(): boolean {
        return this.$store.state.valid;
    }

    private get ready(): boolean {
        return this.$store.state.ready;
    }

    private get definedGridSize(): number {
        return this.$store.state.gridSize;
    }

    private get definedDifficulityLevel(): number {
        return this.$store.state.difficulityLevel;
    }

    private get hiddenNumbers(): number {
        return this.definedDifficulityLevel * 3;
    }

    // Helper values
    private rows: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    private columns: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Settings
    private maxNumberOfErrors: number = 3000;

    // Solution collections
    private solutionRow: number[][] = [];
    private solutionColumn: number[][] = [];
    private solutionSquare: number[][] = [];

    // Working copy of solution
    private workingSolution: any[][] = [];
    private hideNumbers: string[] = [];

    // Creator methods
    public createNew(): void {
        this.reset();
        this.createMapOfHiddenNumbers();
        this.createSolution();
    }

    public reset(): void {
        this.solutionRow = [];
        this.solutionColumn = [];
        this.solutionSquare = [];
        this.workingSolution = [];
        this.hideNumbers = [];
    }

    private mounted() {
        this.createNew();
    }

    // Watchers
    @Watch('workingSolution')
    private onPropertyChanged(value: any, oldValue: any) {
        if (this.$store.state.ready) {
            this.validate();
        }
    }

    // Validation methods
    private validate(): void {
        const valid = this.arrayEquals(this.solutionRow, this.workingSolution);
        if (valid) {
            this.$store.dispatch('setValid', true).then(() => {
                this.shoutResult();
            });
        }
    }

    private shoutResult(): void {
        const timeSpent = this.$store.state.timeSpent;
        const records = this.$store.state.records[this.$store.state.difficulityLevel];
        const sortedRecords = records.sort((a: any, b: any) => a - b);
        const place = sortedRecords.indexOf(timeSpent) + 1;
        const text: string[] = [];
        text.push('You ended in place ' + place);
        text.push('Finishing in ' + timeSpent + ' seconds');
        if (sortedRecords.length > 1) {
            if (place === 1) {
                const secondsToPreviousRecord = sortedRecords[1] - timeSpent;
                text.push(secondsToPreviousRecord + ' seconds faster than previous record');
            } else if (place > 1) {
                const secondsFromFirstPlace = timeSpent - sortedRecords[0];
                let firstPlaceText = '';
                if (secondsFromFirstPlace < 10) {
                firstPlaceText += 'Only ';
                }
                firstPlaceText += secondsFromFirstPlace + ' seconds behind the record';
                text.push(firstPlaceText);
            }
        }
        alert(text.join('. '));
    }

    private canBePlacedInRow(row: number, num: number): boolean {
        if (typeof this.solutionRow[row] === 'undefined') {
            return true;
        }
        return this.solutionRow[row].indexOf(num) === -1;
    }

    private canBePlacedInColumn(column: number, num: number): boolean {
        if (typeof this.solutionColumn[column] === 'undefined') {
            return true;
        }
        return this.solutionColumn[column].indexOf(num) === -1;
    }

    private canBePlacedInSquare(square: number, num: number): boolean {
        if (typeof this.solutionSquare[square] === 'undefined') {
            return true;
        }
        return this.solutionSquare[square].indexOf(num) === -1;
    }

    // Helper methods
    private isVisible(row: number, column: number): boolean {
        return this.hideNumbers.indexOf(row + '-' + column) === -1;
    }

    // Todo: Refactor this with a proper method that calculate square number
    private getSquareNumber(row: number, column: number): number {
        if (row <= 2) {
            if (column <= 2) {
                return 1;
            } else if (column <= 5) {
                return 2;
            } else {
                return 3;
            }
        } else if (row <= 5) {
            if (column <= 2) {
                return 4;
            } else if (column <= 5) {
                return 5;
            } else {
                return 6;
            }
        } else {
            if (column <= 2) {
                return 7;
            } else if (column <= 5) {
                return 8;
            } else {
                return 9;
            }
        }
    }

    private getRowColumnKey(row: number, column: number): number {
        return parseInt('' + (row + 1) + (column + 1), 2);
    }

    private extractRowColumnFromKey(key: string): number[] {
        const gridSize: number = this.definedGridSize.toString().length;
        const row: number = parseInt(key.substr(0, gridSize), 2) - 1;
        const column: number = parseInt(key.substr(gridSize, key.length), 2) - 1;
        return [row, column];
    }

    private addNumbersToSolution(numbers: number[], row: number) {
        if (typeof this.solutionRow[row] === 'undefined') {
            this.solutionRow[row] = [];
        }
        this.solutionRow[row] = numbers;
        numbers.forEach((num: number, column: number) => {
            if (typeof this.solutionColumn[column] === 'undefined') {
                this.solutionColumn[column] = [];
            }
            this.solutionColumn[column].push(num);

            const squareNumber = this.getSquareNumber(row, column);
            if (typeof this.solutionSquare[squareNumber] === 'undefined') {
                this.solutionSquare[squareNumber] = [];
            }
            this.solutionSquare[squareNumber].push(num);
        });
    }

    private addNumbers(numbers: number[], row: number): void {
        let column: number = 0;
        let rowErrors: string[] = [];
        let fatalErrors: string[] = [];
        let numberCollection: number[] = [];
        let cloneNumbers: number[] = numbers.slice();
        try {
            while (cloneNumbers.length > 0) {
                const num: number = cloneNumbers[0];
                const square: number = this.getSquareNumber(row, column);
                const canBePlacedInRow = this.canBePlacedInRow(row, num);
                const canBePlacedInColumn = this.canBePlacedInColumn(column, num);
                const canBePlacedInSquare = this.canBePlacedInSquare(square, num);

                if (canBePlacedInRow && canBePlacedInColumn && canBePlacedInSquare) {
                    numberCollection.push(num);
                    cloneNumbers.splice(0, 1);
                    column++;
                } else {
                    // Move number to end of group and try it again
                    cloneNumbers.push(cloneNumbers.splice(0, 1)[0]);

                    // Check if there has been previous errors on this row
                    const errorMessage: string = '' + num + row + column;

                    if (rowErrors.indexOf(errorMessage) > -1) {
                        fatalErrors.push(errorMessage);
                        if (fatalErrors.indexOf(errorMessage) > -1 && fatalErrors.length > this.maxNumberOfErrors) {
                            throw MaxNumberOfErrorsException;
                        }
                        this.addNumbers(numbers.sort(this.randomizeArray), row);
                        rowErrors = [];
                        cloneNumbers = [];
                        numberCollection = [];
                    }
                    rowErrors.push(errorMessage);
                }
            }
            fatalErrors = [];
        } catch (e) {
            // Do nothing
        }
        if (numberCollection.length > 0) {
            this.addNumbersToSolution(numberCollection, row);
        }
    }

    private createMapOfHiddenNumbers(): void {
        while (this.hideNumbers.length < this.hiddenNumbers) {
            // Random number between 0 and 99 that represent each of the cell's within the sudoku board
            const randomNumber = Math.floor(Math.random() * ((this.definedGridSize * 10) + 1));
            let row: number = 0;
            let column: number = 0;
            if (randomNumber <= 9) {
                row = 0;
                column = randomNumber;
            } else {
                const randomNumberString = randomNumber.toString();
                row = parseInt(randomNumberString.substr(0, 1), 10);
                column = parseInt(randomNumberString.substr(1, 1), 10);
            }
            if (row < 0) {
                row = 0;
            } else if (row === 9) {
                row = 8;
            }
            if (column < 0) {
                column = 0;
            } else if (column === 9) {
                column = 8;
            }
            const rowColumn = row + '-' + column;
            if (this.hideNumbers.indexOf(rowColumn) === -1) {
                this.hideNumbers.push(rowColumn);
            }
        }
    }

    private createSolution(): void {
        const rows: number[][] = [];
        for (let row = 0; row < this.definedGridSize; row++) {
            const temp: number[] = [];
            for (let column = 0; column < this.definedGridSize; column++) {
                temp.push(column + 1);
            }
            rows.push(temp.sort(this.randomizeArray));
        }

        // See if they can be placed around
        rows.forEach((numbers: number[], row: number) => {
            this.addNumbers(numbers, row);
        });

        // Use JSON method to aviod type declaration error
        this.workingSolution = JSON.parse(JSON.stringify(this.solutionRow.slice()));

        // Hide some numbers
        this.hideNumbers.forEach((rowColumn: string) => {
            const [row, column] = rowColumn.split('-');
            this.workingSolution[parseInt(row, 10)][parseInt(column, 10)] = null;
        });

        this.$store.dispatch('setReady', true).then(() => {
            this.$store.dispatch('startTimer');
        });
    }

    // Toolbox
    private randomizeArray(a: any, b: any): number {
        return 0.5 - Math.random();
    }

    private arrayEquals = (first: any[], second: any[]) => {
        if (first.length !== second.length) {
            return false;
        }

        for (let i = 0; i < first.length; i++) {
            if (first[i] instanceof Array && second[i] instanceof Array) {
                // New level handle multidimensional arrays
                if (!this.arrayEquals(first[i], second[i])) {
                    return false;
                }
            } else if (parseInt(first[i], 10) !== parseInt(second[i], 10)) {
                return false;
            }
        }
        return true;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
table.sudoku {
    border: 2px solid #000;
    width: 400px;
    height: 400px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
}
table.sudoku tr,
table.sudoku td {
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}

table.sudoku.success, table.sudoku.success td, table.sudoku.success tr {
    border-color: #090!important;
}

table.sudoku td.right-border:not(:last-child) {
  border-right-width: 2px;
  border-right-color: #333;
}

table.sudoku tr.bottom-border:not(:last-child) td {
  border-bottom-width: 2px;
  border-bottom-color: #333;
}

table.sudoku td {
    border-width: 1px;
    width: 20px;
    height: 20px;
    font-size: 16px;
    padding: 0;
    vertical-align: middle;
    text-align: center;
    color: #888;
}

input {
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  text-align: center;
  vertical-align: middle;
  font-size: 16px;
  color: #000;
}

.invalid {
    color: #f00;
}
</style>
