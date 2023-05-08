import React from 'react'
import {Icon, Pagination} from 'semantic-ui-react'
//import { Pagination } from 'antd';
import 'antd/dist/antd.css';

function onShowSizeChange(current, pageSize) {
    console.log(current, pageSize);
  }
  


  export const createPageNavigation = (pageFilter, handlePaginationClick) => {
    return (
        <Pagination
            onPageChange={(e, {activePage}) => handlePaginationClick(activePage-1)}
            defaultActivePage={1}
            ellipsisItem={{content: <Icon name='ellipsis horizontal'/>, icon: true}}
            firstItem={{content: <Icon name='angle double left'/>, icon: true}}
            lastItem={{content: <Icon name='angle double right'/>, icon: true}}
            prevItem={{content: <Icon name='angle left'/>, icon: true}}
            nextItem={{content: <Icon name='angle right'/>, icon: true}}
            totalPages={pageFilter.count}
        />
    )
}

