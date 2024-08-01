import React, { useMemo, useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MaterialReactTable } from 'material-react-table';
import { Box, Button as MUIButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MISDistrict = () => {
  const [selectedOption, setSelectedOption] = useState(null); // Initialize with null
  const [filteredData, setFilteredData] = useState([]);

  const handleOptionChange = (e) => {
    const option = e.target.value;
    setSelectedOption(option);
  };

  const filterData = (option) => {
    let newFilteredData;
    if (option === 'all') {
      newFilteredData = data;
    } else if (option === 'motherRole') {
      newFilteredData = data.slice(0, Math.ceil(data.length / 2));
    } else if (option === 'supplementary') {
      newFilteredData = data.slice(Math.ceil(data.length / 2));
    }
    setFilteredData(newFilteredData);
  };

  useEffect(() => {
    if (selectedOption !== null) {
      filterData(selectedOption);
    } else {
      setFilteredData([]);
    }
  }, [selectedOption]);

  const columns = useMemo(() => [
    {
      accessorKey: 'serialNo',
      header: 'No',
      size: 10,
    },
    {
      accessorKey: 'district',
      header: 'District Name',
      size: 20,
    },
    {
      accessorKey: 'noOfVoters',
      header: 'No Of Voters',
      size: 30,
    },
  ], []);

  const data = useMemo(() => [
    { serialNo: 1, district: 'District A', noOfVoters: 12345 },
    { serialNo: 2, district: 'District B', noOfVoters: 67890 },
    { serialNo: 3, district: 'District C', noOfVoters: 54321 },
    { serialNo: 4, district: 'District D', noOfVoters: 23456 },
    { serialNo: 5, district: 'District E', noOfVoters: 78901 },
    { serialNo: 6, district: 'District F', noOfVoters: 34567 },
    // Add more rows as needed
  ], []);

  const csvConfig = mkConfig({
    filename: 'district_mis',
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExport = (rows, format) => {
    const exportData = rows.map((row, index) => ({
      "No": index + 1,
      "District Name": row.district,
      "No Of Voters": row.noOfVoters,
    }));

    if (format === 'csv') {
      try {
        const csv = generateCsv(csvConfig, exportData);
        download(csvConfig)(csv);
        console.log('Exporting to csv:', exportData);
      } catch (error) {
        console.error('Error generating CSV:', error);
      }
    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF();
        const tableData = exportData.map(row => Object.values(row));
        const tableHeaders = ["No", "District Name", "No Of Voters"];
        autoTable(doc, { head: [tableHeaders], body: tableData });
        doc.save('district_mis.pdf');
        console.log('Exporting to PDF:', exportData);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  return (
    <main className='bg-gray-100'>
      <ToastContainer />
      <div className='container py-3 pl-6 text-black'>
        <Row className='align-items-center mb-4'>
          <Col>
            <h1 className='text-2xl font-bold mb-4'>District MIS</h1>
          </Col>
          <Col className='text-right'>
            <Form className='MISDistrict-form'>
              <Form.Group>
                <div className='d-flex justify-content-end'>
                  <Form.Check
                    type="radio"
                    label="All"
                    name="options"
                    value="all"
                    checked={selectedOption === 'all'}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <Form.Check
                    type="radio"
                    label="Mother Role"
                    name="options"
                    value="motherRole"
                    checked={selectedOption === 'motherRole'}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <Form.Check
                    type="radio"
                    label="Supplementary"
                    name="options"
                    value="supplementary"
                    checked={selectedOption === 'supplementary'}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                </div>
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <hr className='my-4' />
        <h4 className='mt-3 text-xl font-bold mb-3'>
          District MIS List
        </h4>
        <div className='overflow-x-auto'>
          <MaterialReactTable
            columns={columns}
            data={filteredData}
            options={{
              columnFilterDisplayMode: 'popover',
              paginationDisplayMode: 'pages',
            }}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  display: 'flex',
                  gap: '16px',
                  padding: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <MUIButton
                  disabled={filteredData.length === 0}
                  onClick={() => handleExport(filteredData, 'csv')}
                  startIcon={<FileDownloadIcon />}
                >
                  Export All Data (CSV)
                </MUIButton>
                <MUIButton
                  disabled={filteredData.length === 0}
                  onClick={() => handleExport(filteredData, 'pdf')}
                  startIcon={<FileDownloadIcon />}
                >
                  Export All Data (PDF)
                </MUIButton>
              </Box>
            )}
          />
        </div>
      </div>
    </main>
  );
};

export default MISDistrict;
