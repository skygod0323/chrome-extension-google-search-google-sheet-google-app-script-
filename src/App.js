import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { search, getQueries, insertQueryResult } from './api';

function App() {

  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    url: '',
    sheetName: 'Tabellenblatt1'
  });

  const [queries, setQuries] = useState([
   
  ]);

  const [validations, setValidations] = useState({
    url: '',
    sheetName: ''
  })

  const handleChange = (prop, value) => {
    console.log('handle change', prop)
    console.log(validations);
    setValidations(prevState => ({ ...prevState, [prop]: '' }));
    setValues({ ...values, [prop]: value });
  };

  useEffect(() => {
    console.log('test');
  }, [])

  const checkvalidations = () => {
    if (values.url === '') {
        setValidations({ url: 'has-empty', sheetName: ''});
        return false;
    } else if (values.sheetName === '') {
        setValidations({ url: '', sheetName: 'has-empty'});
        return false;
    } else {
        setValidations({ url: '', sheetName: ''});
    }

    return true;
};

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!checkvalidations()) return;

    setLoading(true);


    // get queries from sheet
    let queriesRes;
    try {
      let res = await getQueries(values.url, values.sheetName);
      queriesRes = JSON.parse(res.data);

      console.log('queries: ', queriesRes);

    } catch (err) {
      alert("Can't fetch queries from sheet. Please double check Sheet Url and Sheet Name");
      return;
    }

    if (!queriesRes.success) {
      alert('Got error while you get search queries from google sheet');
      return;
    }

    const searchQueries = queriesRes.data;

    const tmp = searchQueries.map(t => {
      return {query: t.query, result: '', row: t.row}
    })

    setQuries(tmp);

    for (let i=0; i<searchQueries.length; i++) {
      const sq = searchQueries[i];

      try {
        console.log('get search result for query: ', sq.query);
        const result = await search(sq.query);
        const searchRes = result.search_information && result.search_information.total_results ?
                            result.search_information.total_results : 0;
        
        console.log('query result for query: ', sq.query, searchRes);

        console.log('Insert result to sheet');
        
        const insertRes = await insertQueryResult(values.url, values.sheetName, sq.row, searchRes);

        tmp[i].result = searchRes;
        // setQuries(tmp);
        setQuries([...tmp]);

      } catch (err) {
        console.log(err);
      }
    }

    setLoading(true);

  }

  const searchQueryResults = () => queries.map(q => {
    return (
      <div>
        <Row>
          <Col xs={8}>{q.query.length < 20 ? q.query : q.query.substring(0, 20) + '...'}</Col>
          <Col xs={4}>{q.result}</Col>
        </Row>
      </div>
    )
  })
  return (
    <div className="App p-3">
      <h3 className='text-center'>Google Search Extension</h3>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Google Sheet Url</Form.Label>
          <Form.Control type="text" placeholder="Enter google sheet url" 
            value={values.url}
            onChange={e => handleChange('url', e.target.value)}  
          />
          { validations.url && <p className="text-danger text-xs italic">Please input sheet url.</p> }

        </Form.Group>

        { queries.length ?
          <div class="search-result">
            <div className='search-result-header'>
              <Row>
                <Col xs={8} className="text-success">Search Keyword</Col>
                <Col xs={4} className="text-success">Result</Col>
              </Row>
            </div>
            {searchQueryResults()}
          </div> :
          <></>
        }

        {loading ? 
          <>
            <FaSpinner icon="spinner" className="spinner" /> Search is running. Please wait.
          </>
          :
          <Button variant="primary" type="" onClick={handleSearch}>
            Search
          </Button>
        }

      </Form>
    </div>
  );
}

export default App;
