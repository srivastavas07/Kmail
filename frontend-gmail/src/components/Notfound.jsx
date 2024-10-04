import React from 'react'
import { CircleX } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'

function Notfound() {
    return (
        <div className='h-screen w-screen bg-background flex justify-center items-center relative'>
            <Link className="absolute top-10 left-10" to="/"><ArrowLeft size={28} className="text-primary" strokeWidth={1.75} /></Link>
            <div className='text-4xl flex items-center space-x-3'>
                <CircleX size={65} className="text-primary" strokeWidth={1.75} />
                <div className='space-y-1'>
                    <p className='text-foreground'>404 not found!</p>
                    <p className='text-primary text-sm'>The page you are looking for does not exist.</p>
                </div>
            </div>
            <div className='absolute bottom-3 right-5'>
                <div className='terms w-full mx-auto text-gray-500 my-4 text-sm'>
                    <p className='flex items-center'>Developed with <span className=' text-red-500 mx-1'><Heart size={18} strokeWidth={2.75} /></span> <a className='' href='https://github.com/srivastavas07'>by <span className='font-bold text-foreground'>Kunal Chandra</span></a><ShieldCheck size={20}  strokeWidth={1.75} className='mx-1 text-primary' /> </p>
                </div>
            </div>
        </div>
    )
}

export default Notfound