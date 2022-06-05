import React, { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react'

import { useRouter } from 'next/router';
import {
  SearchIcon,
  OfficeBuildingIcon,
  ArchiveIcon,
  HeartIcon,
  MenuIcon,
  ShoppingCartIcon,
  UsersIcon,
  UserIcon,
  ChartSquareBarIcon,
  AdjustmentsIcon,
  LogoutIcon
} from "@heroicons/react/outline";

import { signIn, signOut, useSession } from 'next-auth/react'; 

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {DateRange} from 'react-date-range';

import logoText from '../assets/logoText.png';
import logoImg from '../assets/logoImg.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Header() {
  const {data: session} = useSession();
  const router = useRouter();
  // const open = useRecoilState(modalState); FOR READ ONLY STATES
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [noOfGuests, setNoOfGuests] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [invalidUserImage, setInvalidUserImage] = useState(false);

  const resetInput = () => {
    setSearchInput("");
    setEndDate(new Date());
    setStartDate(new Date());
  }

  const selectionRange = {
    startDate:startDate,
    endDate:endDate,
    key: 'selection',
  }

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
  }

  const search = () => {
    router.push({
      pathname: "/search",
      query: {
        location: searchInput,
        startDate: startDate.toUTCString(),
        endDate: endDate.toUTCString(),
        noOfGuests
      }
    });
  }

  const openMenu = () => {
    setMenuOpen(!menuOpen);
  }

  return (
    <div>
      <header className='shadow-sm border-b bg-white sticky top-0 z-50 px-1 md:px-10 grid grid-cols-3'>
        {/* Logo */}
        <div className='items-center my-auto'>
          <div className='relative w-24 hidden lg:inline-grid cursor-pointer items-center' onClick={() => router.push('/')}>
            <img src={logoText.src} layout="fill"
            objectfit='contain'/>
          </div>
          <div className='relative w-10 lg:hidden flex-shrink-0 cursor-pointer items-center my-auto' onClick={() => router.push('/')}>
            <img src={logoImg.src} layout='fill'
            objectfit='contain'/>
          </div>
        </div>
            

        {/* Search Bar */}
        <div className='flex items-center px-1 mx-auto'>
          <div className='mt-1 relative p-2 rounded-md'>
            <div className='absolute inset-y-0 pl-3 flex items-center
            pointer-events-none'>
              <SearchIcon className='h-5 text-gray-500 w-5' />
            </div>
            <input className='bg-gray-50 block w-full pl-10 sm:text-sm py-1
            focus:ring-black focus:border-black rounded-md border-gray-300'
            onChange={(e)=> setSearchInput(e.target.value)}
            placeholder='Search' />
          </div>
        </div>
            

        {/* Menu Buttons */}
        <div className='flex items-center space-x-4 justify-end'>
          <div className='relative navBtn mb-1 -mr-2'>
            <OfficeBuildingIcon className='navBtn pt-0.5'/>
            <div className='absolute rounded-full bg-red-500 -top-1 -right-1
              text-xs w-3 h-3 flex items-center justify-center animate-pulse'></div>
          </div>
          {/* Navigation options */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button>
                <MenuIcon className="h-8 mt-2 p-1 cursor-pointer md:hidden
                hover:scale-125 transition-all duration-150 ease-out" aria-hidden="true"
                onClick={openMenu} />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-50"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        onClick={() => router.push('/nowhere')}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Properties
                      </a>
                    )}
                  </Menu.Item>
                  {session && (
                    <>
                    { session.user.isAdmin && (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={() => router.push('/nowhere')}
                              className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Analitics
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={() => router.push('/admin/dashboard')}
                              className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Administration
                            </a>
                          )}
                        </Menu.Item>
                      </>
                    )}
                    </>
                  )}
                  
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {session ? (
            <>             
              {session.user.isAdmin && (
                <>
                  <ChartSquareBarIcon className='navBtn' />
                  <AdjustmentsIcon className='navBtn' onClick={() => router.push('/admin/dashboard')}/>
                </>
              )}

                {/* Account menu */}
              <Menu as="div" className="relative inline-block text-left mt-1"> 
                <div>
                  <Menu.Button>
                  {session.user.image && !invalidUserImage ? <img src={session.user.image} alt='profile pic'
                  className='rounded-full mt-1 cursor-pointer pt-1' layout='fill' onError={setInvalidUserImage(true)}/> 
                  : 
                  <div>
                    <UserIcon className='rounded-full h-9 cursor-pointer bg-gray-200 p-1.5 text-gray-700' />
                  </div>
                  }
                  
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-50"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => router.push('/nowhere')}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'flex px-4 py-2 text-sm'
                            )}
                          >
                            {session.user.image && !invalidUserImage ? <img src={session.user.image} alt='profile pic'
                            className='rounded-full h-10 w-10 cursor-pointer' layout='fill' onError={setInvalidUserImage(true)}/> 
                            : 
                            <div>
                              <UserIcon className='rounded-full h-10 w-10 cursor-pointer bg-gray-200 p-2' />
                            </div>
                            }
                            <div className='relative mx-4 justify-end'>
                              <h2 className='font-bold truncate w-32'>{session.user.name}</h2>
                              <h3 className='text-sm text-gray-400 truncate w-32'>{session.user?.email}</h3>
                            </div>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => router.push('/user/orderHistory')}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'flex px-4 py-2 text-sm justify-between'
                            )}
                          >
                              My Orders
                              <ArchiveIcon className='navBtn'/>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => router.push('/nowhere')}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'flex justify-between px-4 py-2 text-sm'
                            )}
                          >
                            My Wishlist
                            <HeartIcon className='navBtn' />
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => router.push('/user/cart')}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'flex justify-between px-4 py-2 text-sm'
                            )}
                          >
                            My Cart
                            <ShoppingCartIcon className='navBtn' />
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => {signOut(); router.push("/")}}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'flex justify-between px-4 py-2 text-sm'
                            )}
                          >
                            Log out
                            <LogoutIcon className='navBtn' />
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              
            </>
            
          ): (
            <button onClick={signIn}>Log in</button>
          )}
        </div>
        {searchInput && !menuOpen && (
            <div className='flex flex-col mx-auto mt-1 col-span-3 mb-3'>
              <DateRange 
                ranges={[selectionRange]}
                minDate={new Date()}
                rangeColors={["#AAC6A7"]}
                onChange={handleSelect}
              />
              <div className='flex items-center border-b mb-4'>
                <h2 className='text-xl pl-2 font-semibold flex-grow'>
                  Number of Guests
                </h2>
                <UsersIcon className='h-5' />
                <input type="number" value={noOfGuests} min={1}
                onChange={e => setNoOfGuests(e.target.value)}
                className='w-12 pl-2 text-lg outline-none text-primary border-0'/>
              </div>
              <div className='flex'>
                <button className='flex-grow font-semibold text-gray-500 cursor-pointer'
                onClick={resetInput}>Cancel</button>
                <button className='flex-grow text-primary font-semibold cursor-pointer'
                onClick={search}>Search</button>
              </div>
            </div>
        )}
      </header>
    
    </div>
    
  )
}

export default Header