import React from 'react'
import { isTemplateSpan } from 'typescript'

function DataTable({renderHead, renderRow, items}) {
  return (
    <div className='p-5 shadow rounded-md w-max box-border overflow-auto'>
        <table className='border-gray-200 border-[1px]'>
            <thead className='bg-gray-50 border-b-2 border-gray-200'>
                {renderHead()}
            </thead>
            <tbody>
                {items.map((row) => renderRow(row))}    
            </tbody>
        </table>
    </div>
  )
}

export default DataTable