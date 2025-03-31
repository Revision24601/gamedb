'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { GameStatus } from '@/lib/validators';

interface StatusSelectorProps {
  status: GameStatus;
  onChange: (status: GameStatus) => void;
}

const statusColors = {
  'Playing': 'bg-green-100 text-green-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Dropped': 'bg-red-100 text-red-800',
  'Plan to Play': 'bg-purple-100 text-purple-800',
};

const statusOptions: GameStatus[] = [
  'Playing',
  'Completed',
  'On Hold',
  'Dropped',
  'Plan to Play',
];

const StatusSelector = ({ status, onChange }: StatusSelectorProps) => {
  return (
    <Listbox value={status} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
            <span className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {status}
              </span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FaChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {statusOptions.map((statusOption) => (
                <Listbox.Option
                  key={statusOption}
                  className={({ active }) =>
                    `${
                      active ? 'text-white bg-primary-600' : 'text-gray-900 dark:text-gray-100'
                    } cursor-pointer select-none relative py-2 pl-3 pr-9`
                  }
                  value={statusOption}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusOption]}`}>
                          {statusOption}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={`${
                            active ? 'text-white' : 'text-primary-600'
                          } absolute inset-y-0 right-0 flex items-center pr-4`}
                        >
                          <FaCheck className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

export default StatusSelector; 