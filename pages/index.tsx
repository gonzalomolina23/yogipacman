import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Podcast, Search, ChevronUp, Instagram, Twitter, Youtube, Play, Pause, Calendar, Clock, Share2, X } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { fetchRssFeed, Episode } from '../lib/fetchRssFeed'
import { toast } from "@/components/ui/use-toast"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ExploringYogaLanding() {
  const [podcastData, setPodcastData] = useState<{ episodes: Episode[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [visibleEpisodes, setVisibleEpisodes] = useState(6)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const loadPodcastData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRssFeed('https://anchor.fm/s/fc082f30/podcast/rss')
        setPodcastData(data)
      } catch (err) {
        console.error('Error loading podcast data:', err)
        setError('Failed to load podcast data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPodcastData()
  }, [])

  const handlePlayPause = (audioUrl: string) => {
    if (currentlyPlaying === audioUrl) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
      setCurrentlyPlaying(audioUrl)
    }
  }

  const handleSuggest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSending(true)
    try {
      const response = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestion }),
      })

      if (!response.ok) {
        throw new Error('Failed to send suggestion')
      }

      const data = await response.json()
      toast({
        title: "Suggestion received!",
        description: data.message || "Thank you for your content suggestion. We appreciate your input!",
      })
      setSuggestion('')
    } catch (error) {
      console.error('Error sending suggestion:', error)
      toast({
        title: "Error",
        description: "Failed to send your suggestion. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const stripHtmlTags = (html: string) => {
    return html.replace(/<\/?[^>]+(>|$)/g, "")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 300)
  }

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setSearchTerm('')
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }

  const filteredEpisodes = podcastData?.episodes.filter(episode =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stripHtmlTags(episode.description).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const loadMoreEpisodes = () => {
    setVisibleEpisodes(prevVisible => prevVisible + 4)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Podcast className="h-6 w-6 text-teal-600" aria-hidden="true" />
              <span className="text-lg font-bold text-teal-800 whitespace-nowrap">Exploring Yoga</span>
            </Link>
            <div className="flex items-center">
              <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full sm:w-64' : 'w-8'}`}>
                {isSearchExpanded ? (
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search episodes..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-10 py-2 text-sm bg-white text-teal-900 border-teal-300 focus:border-teal-500 focus:ring-teal-500"
                      aria-label="Search episodes"
                      ref={searchInputRef}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-600" />
                    <button
                      onClick={toggleSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
                      aria-label="Close search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {isSearching && (
                      <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-teal-600">
                        Searching...
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={toggleSearch}
                    className="p-2 text-teal-600 hover:text-teal-800"
                    aria-label="Open search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-12 md:py-16 bg-teal-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-teal-800 mb-4">
                Exploring Yoga Podcast
              </h1>
              <p className="text-lg md:text-xl text-teal-600 mb-6">
                Light conversations on Yoga, mindfulness and more
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="https://open.spotify.com/show/5ziwfGEie17cMl4r7ivx4v" passHref>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto">
                    Listen on Spotify
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-teal-600 text-teal-600 hover:bg-teal-100 w-full sm:w-auto"
                >
                  Watch on YouTube
                </Button>
              </div>
            </div>
          </div>
        </section>

        {searchTerm && (
          <section id="search-results" className="py-10 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Search Results</h2>
              {filteredEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEpisodes.map((episode, index) => (
                    <Card key={index} className="bg-white overflow-hidden">
                      <CardContent className="p-3">
                        <Image
                          src={episode.imageUrl || "/placeholder.svg?height=300&width=300"}
                          alt={episode.title}
                          width={300}
                          height={300}
                          className="rounded-lg mb-3 w-full"
                          loading="lazy"
                        />
                        <Link href={`/episodes/${encodeURIComponent(episode.title.toLowerCase().replace(/ /g, '-'))}`}>
                          <h4 className="text-base font-semibold text-teal-800 mb-1 hover:underline">{episode.title}</h4>
                        </Link>
                        <div className="flex items-center space-x-4 mb-2 text-xs text-teal-600">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {episode.duration}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(episode.pubDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-teal-700 mb-2 text-xs line-clamp-2">{stripHtmlTags(episode.description)}</p>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-100 text-xs py-1"
                            onClick={() => handlePlayPause(episode.audioUrl)}
                          >
                            {currentlyPlaying === episode.audioUrl ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Play
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-teal-600 hover:bg-teal-50 text-xs py-1"
                            onClick={() => {
                              navigator.clipboard.writeText(episode.spotifyUrl || window.location.href)
                              toast({ title: "Link copied!", description: "The episode link has been copied to your clipboard." })
                            }}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-teal-700 text-sm">No episodes found matching your search.</p>
              )}
            </div>
          </section>
        )}

        {!searchTerm && (
          <section id="episodes" className="py-10 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">All Episodes</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">
                  <p>{error}</p>
                  <Button onClick={() => window.location.reload()} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                    Retry
                  </Button>
                </div>
              ) : podcastData && podcastData.episodes && podcastData.episodes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {podcastData.episodes.slice(0, visibleEpisodes).map((episode, index) => (
                      <Card key={index} className={`bg-white overflow-hidden ${index === 0 ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                        <CardContent className={`p-6 ${index === 0 ? 'md:flex md:items-center md:gap-6' : ''}`}>
                          <div className={index === 0 ? 'md:w-1/3' : ''}>
                            <Image
                              src={episode.imageUrl || "/placeholder.svg?height=300&width=300"}
                              alt={episode.title}
                              width={300}
                              height={300}
                              className="rounded-lg mb-4 w-full"
                              loading="lazy"
                            />
                          </div>
                          <div className={index === 0 ? 'md:w-2/3' : ''}>
                            <Link href={`/episodes/${encodeURIComponent(episode.title.toLowerCase().replace(/ /g, '-'))}`}>
                              <h3 className={`font-bold text-teal-800 mb-2 hover:underline ${index === 0 ? 'text-xl' : 'text-lg'}`}>{episode.title}</h3>
                            </Link>
                            <div className="flex items-center space-x-4 mb-2 text-sm text-teal-600">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {episode.duration}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4  h-4 mr-1" />
                                {new Date(episode.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className={`text-teal-700 mb-4 ${index === 0 ? 'text-sm' : 'text-xs line-clamp-2'}`}>
                              {stripHtmlTags(episode.description)}
                            </p>
                            <div className="flex space-x-3">
                              <Button 
                                className={`flex-1 bg-teal-600 hover:bg-teal-700 text-white ${index === 0 ? '' : 'text-xs py-1'}`}
                                onClick={() => handlePlayPause(episode.audioUrl)}
                              >
                                {currentlyPlaying === episode.audioUrl ? (
                                  <>
                                    <Pause className={`${index === 0 ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-1'}`} />
                                    {index === 0 ? 'Pause Episode' : 'Pause'}
                                  </>
                                ) : (
                                  <>
                                    <Play className={`${index === 0 ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-1'}`} />
                                    {index === 0 ? 'Play Episode' : 'Play'}
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                className={`text-teal-600 hover:bg-teal-50 ${index === 0 ? '' : 'text-xs py-1'}`}
                                onClick={() => {
                                  navigator.clipboard.writeText(episode.spotifyUrl || window.location.href)
                                  toast({ title: "Link copied!", description: "The episode link has been copied to your clipboard." })
                                }}
                              >
                                <Share2 className={`${index === 0 ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-1'}`} />
                                Share
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {visibleEpisodes < podcastData.episodes.length && (
                    <div className="text-center mt-8">
                      <Button 
                        onClick={loadMoreEpisodes} 
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Load More Episodes
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-teal-700 text-sm">No episodes available.</p>
              )}
            </div>
          </section>
        )}

        <section id="suggest" className="py-10 bg-teal-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">Suggest Content</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bulb-LBoWqdcqgQq9GTbiMNxo2x2nkF1biN.webp"
                    alt="Creative light bulb"
                    width={300}
                    height={300}
                    className="rounded-lg shadow-lg w-full max-w-[300px]"
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <p className="text-teal-700 mb-4 text-sm text-center md:text-left">
                    Share your curiosity and help shape our future episodes
                  </p>
                  <form onSubmit={handleSuggest} className="space-y-3">
                    <Textarea 
                      placeholder="I'm curious about..." 
                      className="w-full bg-white text-teal-900 text-sm"
                      rows={3}
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      required
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm"
                      disabled={isSending}
                    >
                      {isSending ? 'Submitting...' : 'Submit Your Idea'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">About Exploring Yoga</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 flex justify-center md:justify-start order-1 md:order-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9bN5TehjiIwJL5JeSIuMC0iGIhBBXb.png"
                    alt="Abstract representation of yoga and mindfulness"
                    width={300}
                    height={300}
                    className="rounded-lg shadow-lg w-full max-w-[300px]"
                  />
                </div>
                <div className="w-full md:w-1/2 order-2 md:order-1 flex flex-col justify-center">
                  <p className="text-teal-700 mb-3 text-sm text-center md:text-left">
                    Yoga is more than just a practice; it's a path to self-discovery, balance, and holistic well-being. At Exploring Yoga, we believe that yoga should be accessible to everyone, whether you're a seasoned practitioner or just starting your journey.
                  </p>
                  <p className="text-teal-700 text-sm text-center md:text-left">
                    Our platform is designed to explore all aspects of yoga—from the ancient texts that shaped its philosophy to the modern-day practices that help us stay grounded in a fast-paced world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-10 bg-teal-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Exploring Yoga Podcast about?</AccordionTrigger>
                <AccordionContent>
                  Exploring Yoga Podcast is a series of light conversations about yoga, mindfulness, and related topics. We aim to make yoga accessible to everyone, from beginners to experienced practitioners.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How often are new episodes released?</AccordionTrigger>
                <AccordionContent>
                  We release new episodes on a weekly basis, typically every Monday. However, this may vary occasionally, so be sure to subscribe to stay updated!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I suggest topics for future episodes?</AccordionTrigger>
                <AccordionContent>
                  We love hearing from our listeners. You can use the 'Suggest Content' section on our website to share your ideas for future episodes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Where can I listen to the podcast?</AccordionTrigger>
                <AccordionContent>
                  You can listen to Exploring Yoga Podcast on Spotify, Apple Podcasts, Google Podcasts, and most other major podcast platforms. You can also play episodes directly from our website.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Is this podcast suitable for beginners?</AccordionTrigger>
                <AccordionContent>
                  Yes! Our podcast is designed to be accessible for listeners at all levels, from complete beginners to experienced yogis. We cover a wide range of topics and always aim to explain concepts clearly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="bg-teal-800 text-white py-6 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-3 md:mb-0">
              <Podcast className="h-5 w-5 text-teal-400" aria-hidden="true" />
              <span className="text-lg font-bold text-teal-400 ml-2">Exploring Yoga</span>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end space-x-4">
              <a href="#episodes" className="hover:text-teal-300 text-sm">Episodes</a>
              <a href="#suggest" className="hover:text-teal-300 text-sm">Suggest Content</a>
              <a href="#about" className="hover:text-teal-300 text-sm">About</a>
              <a href="#faq" className="hover:text-teal-300 text-sm">FAQ</a>
            </nav>
          </div>
          <div className="flex justify-center space-x-4 mb-3">
            <a href="#" className="hover:text-teal-300" aria-label="Instagram">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#" className="hover:text-teal-300" aria-label="Twitter">
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#" className="hover:text-teal-300" aria-label="YouTube">
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <div className="text-center text-xs">
            © {new Date().getFullYear()} Exploring Yoga. All rights reserved.
          </div>
        </div>
      </footer>

      <audio ref={audioRef} />
    </div>
  )
}