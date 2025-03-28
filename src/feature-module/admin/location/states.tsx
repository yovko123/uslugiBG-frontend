import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import * as Icon from 'react-feather';

import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { Dropdown } from 'primereact/dropdown';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import StateModal from '../common/modals/state-modal';
import DeleteStatesModal from '../common/modals/delete-state-modal';
import { StateDatas } from '../../../core/models/interface';

const States = () => {
  const [selectedValue, setSelectedValue] = useState(null);
  const value = [{ name: 'A - Z' }, { name: 'Z - A' }];
  const data = useSelector((state: any) => state.states_Date);
  const actionButton = () => {
    return (
      <div className="table-actions d-flex">
        <Link
          className="delete-table me-2"
          to="#"
          data-bs-toggle="modal"
          data-bs-target="#edit-state"
        >
          <Icon.Edit className="react-feather-custom" />
        </Link>
        <Link
          className="delete-table border-none"
          to="#"
          data-bs-toggle="modal"
          data-bs-target="#delete-state"
        >
          <Icon.Trash2 className="react-feather-custom" />
        </Link>
      </div>
    );
  };
  const walletImg = (data: StateDatas) => {
    return (
      <div>
        <Link to="#" className="table-imgname flag-image">
          <ImageWithBasePath src={data.img} className="me-2" alt="img" />
          <span>{data.countryName}</span>
        </Link>
      </div>
    );
  };

  return (
    <>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>State</h5>
            <div className="list-btn">
              <ul>
                <li>
                  <div className="filter-sorting">
                    <ul>
                      <li>
                        <Link to="#" className="filter-sets">
                          <Icon.Filter className="react-feather-custom me-2" />
                          Filter
                        </Link>
                      </li>
                      <li>
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/sort.svg"
                            className="me-2"
                            alt="img"
                          />
                        </span>
                        <div className="review-sort">
                          <Dropdown
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(e.value)}
                            options={value}
                            optionLabel="name"
                            placeholder="A - Z"
                            className="select admin-select-breadcrumb"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <button
                    className="btn btn-primary"
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#add-state"
                  >
                    <i className="fa fa-plus me-2" />
                    Add State
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-12 ">
              <div className="table-resposnive">
                <table className="table datatable">
                  <DataTable
                    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink  "
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    value={data}
                    showGridlines
                    tableStyle={{ minWidth: '50rem' }}
                  >
                    <Column sortable field="id" header="ID"></Column>
                    <Column
                      sortable
                      field="countryCode"
                      header="CountryCode"
                    ></Column>
                    <Column
                      sortable
                      field="countryName"
                      header="CountryName"
                      body={walletImg}
                    ></Column>
                    <Column
                      sortable
                      field="stateName"
                      header="StateName"
                    ></Column>
                    <Column
                      sortable
                      field="Action"
                      header="Action"
                      body={actionButton}
                    ></Column>
                  </DataTable>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StateModal />
      <DeleteStatesModal />
    </>
  );
};

export default States;
