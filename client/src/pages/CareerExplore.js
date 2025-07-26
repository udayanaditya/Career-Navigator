import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CareerExplore = () => {
  const [careers, setCareers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minSalary: '',
    maxSalary: '',
    outlook: '',
    sort: 'title',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/careers/categories');
        setCategories(res.data.data);
      } catch (err) {
        setError('Error fetching categories');
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        // Add filters to query params
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.minSalary) queryParams.append('minSalary', filters.minSalary);
        if (filters.maxSalary) queryParams.append('maxSalary', filters.maxSalary);
        if (filters.outlook) queryParams.append('outlook', filters.outlook);
        if (filters.sort) queryParams.append('sort', filters.sort);
        
        // Add pagination
        queryParams.append('page', pagination.page);
        queryParams.append('limit', 12);

        const res = await axios.get(`/api/careers?${queryParams.toString()}`);
        setCareers(res.data.data);
        setPagination(res.data.pagination);
        setLoading(false);
      } catch (err) {
        setError('Error fetching careers');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCareers();
  }, [filters, pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    // Reset to page 1 when filters change
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The useEffect will handle the fetch with updated filters
  };

  if (loading && careers.length === 0) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-primary">Explore Careers</h1>
      <p className="lead">Browse and filter through various career options</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-3">
            <div className="form-group">
              <input
                type="text"
                placeholder="Search careers..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <select
                name="outlook"
                value={filters.outlook}
                onChange={handleFilterChange}
              >
                <option value="">All Job Outlooks</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <input
                type="number"
                placeholder="Min Salary"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Max Salary"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="title">Sort by Title</option>
                <option value="salary-high">Highest Salary</option>
                <option value="salary-low">Lowest Salary</option>
                <option value="outlook">Best Outlook</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Apply Filters
          </button>
        </form>
      </div>

      <div className="career-results">
        <p>
          Showing {careers.length} of {pagination.total} careers
        </p>

        {careers.length === 0 ? (
          <div className="alert alert-info">No careers found matching your criteria</div>
        ) : (
          <div className="grid-3">
            {careers.map((career) => (
              <div className="career-card" key={career._id}>
                <div className="career-card-header">
                  <h3>{career.title}</h3>
                </div>
                <div className="career-card-body">
                  <p>{career.description.substring(0, 150)}...</p>
                  <div className="career-categories">
                    {career.categories.map((category, index) => (
                      <span className="badge" key={index}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="career-card-footer">
                  <div>
                    <strong>Salary:</strong> ${career.salary.mid.toLocaleString()}
                  </div>
                  <Link to={`/careers/${career._id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn btn-light"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn btn-light"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerExplore;