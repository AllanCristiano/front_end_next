"use client"

import { useState } from "react"
import type { Document, DocumentType, DateRange } from "../types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, Download, FileBarChart2, Filter, Files } from "lucide-react"
import { DocumentFilters } from "./document-filters"
import { Pagination } from "./pagination"
import { Button } from "@/components/ui/button"

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<DocumentType | "ALL">("ALL")
  const itemsPerPage = 5

  // Filtra os documentos com base na busca, aba ativa e data
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "ALL" || doc.type === activeTab

    const docDate = new Date(doc.date)
    const matchesDateRange =
      (!dateRange.from || docDate >= dateRange.from) && (!dateRange.to || docDate <= dateRange.to)

    return matchesSearch && matchesTab && matchesDateRange
  })

  // Ordena os documentos do mais novo para o mais antigo
  const sortedDocuments = filteredDocuments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const documentStats = {
    total: documents.length,
    filtered: filteredDocuments.length,
    byType: {
      ORDINANCE: documents.filter((doc) => doc.type === "PORTARIA").length,
      ORDINARY_LAW: documents.filter((doc) => doc.type === "LEI_ORDINARIA").length,
      COMPLEMENTARY_LAW: documents.filter((doc) => doc.type === "LEI_COMPLEMENTAR").length,
      DECREE: documents.filter((doc) => doc.type === "DECRETO").length,
    },
  }

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const paginatedDocuments = sortedDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (type: DocumentType | "ALL", newDateRange: DateRange) => {
    setDateRange(newDateRange)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleTabChange = (value: DocumentType | "ALL") => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  // Função para baixar o PDF usando o endpoint interno
  const handleDownload = (filename: string) => {
    const url = `/documentos/${filename}.pdf`
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.pdf`
    link.click()
  }

  function formatarDataPorExtenso(dataStr: string): string {
    const [ano, mes, dia] = dataStr.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia) // Mês começa do 0 em JavaScript

    const opcoes: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("pt-BR", opcoes).format(data).toLowerCase()
  }

  function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  }

  const tabs = [
    { id: "ALL", label: "Todos" },
    { id: "PORTARIA", label: "Portarias" },
    { id: "LEI_ORDINARIA", label: "Leis Ordinárias" },
    { id: "LEI_COMPLEMENTAR", label: "Leis Complementares" },
    { id: "DECRETO", label: "Decretos" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats Cards - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-green-700 to-green-600 text-white">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg font-medium">Total de Documentos</CardTitle>
                <Files className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{documentStats.total}</p>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-500 text-white">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg font-medium">Documentos Filtrados</CardTitle>
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{documentStats.filtered}</p>
            </CardHeader>
          </Card>

          <Card className="sm:col-span-2 bg-gradient-to-br from-green-800 to-green-700 text-white">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-sm sm:text-lg font-medium">Distribuição por Tipo</CardTitle>
                <FileBarChart2 className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Portarias</span>
                    <span className="font-bold text-sm sm:text-base">{documentStats.byType.ORDINANCE}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Leis Ordinárias</span>
                    <span className="font-bold text-sm sm:text-base">{documentStats.byType.ORDINARY_LAW}</span>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Leis Complementares</span>
                    <span className="font-bold text-sm sm:text-base">{documentStats.byType.COMPLEMENTARY_LAW}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Decretos</span>
                    <span className="font-bold text-sm sm:text-base">{documentStats.byType.DECREE}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <DocumentFilters
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          hideTypeFilter={true}
        />

        {/* CSS-Only Style Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto scrollbar-hide max-w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as DocumentType | "ALL")}
                    className={`
                    relative flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 
                    text-sm sm:text-base font-medium transition-all duration-300 ease-in-out
                    border-b-3 min-w-max border-2 border-transparent
                    ${
                      activeTab === tab.id
                        ? "text-green-700 dark:text-green-400 border-b-green-700 dark:border-b-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600"
                        : "text-gray-600 dark:text-gray-400 border-b-transparent hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                  >
                    <div className="flex flex-col items-center">
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </div>

                    {/* Active indicator line */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-700 dark:bg-green-400 transform transition-all duration-300 rounded-t-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                {paginatedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-xl bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-90 border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                  >
                    <CardHeader className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-4">
                        <CardTitle className="flex items-start gap-2 text-lg sm:text-xl">
                          <FileText className="h-5 w-5 text-green-700 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">
                            {toTitleCase(doc.title).split("Nº").join("nº") + " de " + formatarDataPorExtenso(doc.date)}
                          </span>
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm sm:text-base">
                        Número do documento: {doc.number}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                        {doc.description}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleDownload(doc.number.split("/").join("").split(".").join("") + "-" + doc.date)
                        }
                        className="w-full sm:w-auto group hover:bg-green-50 dark:hover:bg-green-900 border-2 border-green-200 hover:border-green-300 dark:border-green-600 dark:hover:border-green-500"
                      >
                        <Download className="h-4 w-4 text-green-700 group-hover:text-green-800 mr-2" />
                        Baixar PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg sm:text-xl font-medium text-muted-foreground px-4">
                      Nenhum documento encontrado com os critérios selecionados
                    </p>
                  </div>
                )}
              </div>

              {filteredDocuments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .border-b-3 {
        border-bottom-width: 3px;
      }
    `}</style>
    </div>
  )
}
