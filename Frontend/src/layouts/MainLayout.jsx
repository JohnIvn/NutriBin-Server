import Header from '@/components/partials/header'
import PageRouter from './PageRouter'
import Footer from '@/components/partials/footer'
import axios from 'axios'
import { useEffect } from 'react'

function MainLayout() {
	
	useEffect(() => {
		const fetchMessage = async () => {
			const data = await axios.get('http://localhost:3000')
			if (data) {
				console.log("This message ensures connection with the backend", data.data)
			}
			console.log("No message")
		}
		fetchMessage()
	}, [])

	return (
		<section className='min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]'>
			<Header />
			<PageRouter />
			<Footer />
		</section>
	)
}

export default MainLayout
