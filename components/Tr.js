import React from 'react';
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/react/solid'

function Tr({sortable = false, label}) {
    const doSomething = () => {
        console.log(label +  ' did something');
    }
  return (
    <th className='dataTableHeader'>
        <div className='flex'>
            <div className='w-full'>
                {label}
            </div>
            {sortable && (
                <div className='flex hover:shadow-md hover:border-[1px] 
                rounded-md w-5 pr-1 ml-1' onClick={doSomething}>
                    <ArrowNarrowDownIcon className='w-3 text-gray-500'/>
                    <ArrowNarrowUpIcon className='-m-1 w-3 text-gray-500'/>
                </div>
            )}
        </div>
    </th>
  )
}

export default Tr