import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative  overflow-hidden ">
      <div className="absolute inset-0 " aria-hidden="true" />
      <div className="absolute right-0 top-1/2 hidden h-[50%] w-[42%] -translate-y-1/2 xl:block" aria-hidden="true">
        <Image
          src="/earth-png.gif"
          alt=""
          fill
          unoptimized
          className="object-contain"
        />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 py-10 dark:text-white">
        <div className="max-w-2xl">
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
              I don't think I'm as revolutionary as Galileo, but I don't think I'm not as revolutionary as Galileo.
          </h2>
            <p className="mt-6 text-lg dark:text-slate-300 text-slate-600">
                - Jaden Smith
            </p>


        </div>

        <div className="mt-8 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center">
        </div>
      </div>
    </footer>
  );
}
