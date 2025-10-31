import { ImGithub } from "react-icons/im";
import { MdCreateNewFolder } from "react-icons/md";

export default function Nav() {
  return (
    <>
      <nav className="bg-nav-color border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              Pastebin
            </span>
          </a>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
              <li>
                <a
                  href="/new"
                  className="block py-2 px-3 text-white bg-nav-color rounded hover:bg-gray-100 hover:text-black md:p-0 dark:text-white md:dark:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  <MdCreateNewFolder className="inline-block mr-2 text-xl" />
                  New Paste
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sama-004/pastebin"
                  className="block py-2 px-3 text-white bg-nav-color rounded hover:bg-gray-100 hover:text-black md:p-0 dark:text-white md:dark:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  <ImGithub className="inline-block mr-2 text-xl" />
                  Github
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
