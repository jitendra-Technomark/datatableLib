import React from 'react';
import { CSVLink } from 'react-csv/lib/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './DataTable.module.css';

class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      filteredData: props.data,
      currentPage: 1,
      itemsPerPage: 10,
      sortingColumn: '',
      sortingOrder: 'asc',
    };
  }

  handleSort = (column) => {
    const { sortingColumn, sortingOrder, filteredData } = this.state;

    // Determine the new sorting order and column
    let newSortingOrder = 'asc';
    if (column === sortingColumn && sortingOrder === 'asc') {
      newSortingOrder = 'desc';
    }

    // Perform the sorting
    const sortedData = filteredData.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      } else {
        return 0;
      }
    });

    // Reverse the array if the sorting order is descending
    if (newSortingOrder === 'desc') {
      sortedData.reverse();
    }

    this.setState({
      filteredData: sortedData,
      sortingColumn: column,
      sortingOrder: newSortingOrder,
    });
  };

  // Method for searching
  handleSearch = (e) => {
    const searchTerm = e.target.value;
    this.setState({ searchTerm }, () => {
      this.filterData(searchTerm);
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  handleItemsPerPageChange = (e) => {
    const itemsPerPage = parseInt(e.target.value, 10);
    this.setState({ itemsPerPage });
  };

  filterData = (searchTerm) => {
    const { data } = this.props;
    const filteredData = data.filter((item) => {
      // Customize this based on your data structure and headers
      return Object.values(item).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
    this.setState({ filteredData });
  };

  // Method for exporting CSV
  exportToCSV = () => {
    const { filteredData } = this.state;
    const { headers } = this.props;

    const csvData = filteredData.map((item) => {
      const rowData = {};
      headers.forEach((header) => {
        rowData[header] = item[header];
      });
      return rowData;
    });

    return csvData;
  };

  // Method for exporting PDF
  exportToPDF = () => {
    const { filteredData } = this.state;
    const { headers } = this.props;

    const doc = new jsPDF();
    const tableData = filteredData.map((item) =>
      headers.map((header) => item[header])
    );
    doc.autoTable({
      head: [headers],
      body: tableData,
    });
    doc.save('table.pdf');
  };

  render() {
    const {
      filteredData,
      searchTerm,
      currentPage,
      itemsPerPage,
    } = this.state;
    const { headers, header, footer } = this.props;

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
      <div className={styles.container}>

        <div className={styles.exportButtons}>
          <button className={styles.exportButton}>
            <CSVLink
              data={this.exportToCSV()}
              filename="data.csv"
              className={`${styles.exportButton} ${styles.csv_Btn}`}
            >
              Export CSV
            </CSVLink>
          </button>

          <button
            onClick={this.exportToPDF}
            className={`${styles.exportButton} ${styles.pdf_Btn}`}
          >
            Export PDF
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={this.handleSearch}
          placeholder="Search..."
          className={styles.input}
        />

        {header && (
          <div className={styles.header}>
            {typeof header === 'string' ? (
              <span className={styles.headerText}>{header}</span>
            ) : (
              header
            )}
          </div>
        )}

        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} onClick={() => this.handleSort(header)}>
                  {header}
                  {this.state.sortingColumn === header && (
                    <span>
                      {this.state.sortingOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header}>
                    {typeof item[header] === 'string' &&
                      item[header].startsWith('http') ? (
                      <img
                        src={item[header]}
                        alt="Item"
                        className={styles.image}
                      />
                    ) : (
                      item[header]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button
            onClick={() => this.handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => this.handlePageChange(pageNumber)}
                  className={
                    currentPage === pageNumber ? styles.activePage : ''
                  }
                >
                  {pageNumber}
                </button>
              )
            )}
          </div>

          {/* Custom pagination dropdown */}
          <div className={styles.pagination}>
            <select
              value={itemsPerPage}
              onChange={this.handleItemsPerPageChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={() => this.handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {footer && (
          <div className={styles.footer}>
            {typeof footer === 'string' ? (
              <span className={styles.footerText}>{footer}</span>
            ) : (
              footer
            )}
          </div>
        )}
      </div>
    );
  }
}

export default DataTable;
