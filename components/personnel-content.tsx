"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Users } from "lucide-react"
import type { PersonnelRecord, InspectionRequest } from "@/lib/types"

interface PersonnelContentProps {
  personnel: (PersonnelRecord & { inspection?: Pick<InspectionRequest, 'id' | 'title' | 'request_number'> })[]
}

export function PersonnelContent({ personnel }: PersonnelContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          실명부
        </h1>
        <p className="text-muted-foreground mt-1">
          모든 검측 참여 인원을 조회합니다
        </p>
      </div>

      {personnel.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              등록된 참여 인원이 없습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              검측 요청서 작성 시 참여 인원을 등록하면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>소속</TableHead>
                <TableHead>직위</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>검측 요청서</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnel.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    {person.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {person.company || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {person.position || "-"}
                  </TableCell>
                  <TableCell>
                    {person.role && (
                      <Badge variant="outline">{person.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {person.phone || "-"}
                  </TableCell>
                  <TableCell>
                    {person.inspection && (
                      <Link href={`/inspections/${person.inspection.id}`}>
                        <Badge variant="secondary" className="hover:bg-secondary/80">
                          {person.inspection.request_number}
                        </Badge>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
