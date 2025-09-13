"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getTeamsByClassId } from "@/services/teamServices"
import { Loader2, ChevronDown, ChevronRight, Users, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamUser {
    teamUserId: number
    userId: string
    userName: string | null
    userEmail: string | null
    userNumberCode: string | null
    teamUserStatus: string
}

interface Team {
    teamId: number
    classId: number
    teamName: string
    teamDescription: string | null
    teamStatus: string | null
    className: string
    teamUsers: TeamUser[]
}

interface GroupTabProps {
    classId: string
}

export default function GroupTab({ classId }: GroupTabProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set())

    const fetchTeamsAndUsers = async () => {
        try {
            setLoading(true)
            const response = await getTeamsByClassId(classId)
            setTeams(response)
        } catch (err) {
            setError("Failed to fetch teams or user details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (classId) {
            fetchTeamsAndUsers()
        }
    }, [classId])

    const toggleTeamExpansion = (teamId: number) => {
        setExpandedTeams((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(teamId)) {
                newSet.delete(teamId)
            } else {
                newSet.add(teamId)
            }
            return newSet
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading teams...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive/20">
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">Error Loading Teams</h3>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        )
    }

    if (!teams.length) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-muted-foreground font-semibold text-card-foreground mb-2">No Teams Found</h3>
                    <p className="text-muted-foreground">No teams have been created for this class yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {teams.map((team) => {
                const isExpanded = expandedTeams.has(team.teamId)
                return (
                    <div key={team.teamId}>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-6 bg-card border-b border-border bg-secondary">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTeamExpansion(team.teamId)}
                                        className="p-2 h-auto rounded-full hover:bg-accent/10 transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-card-foreground">{team.teamName}</h3>
                                            {team.teamDescription && (
                                                <p className="text-sm text-muted-foreground mt-1">{team.teamDescription}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Badge variant="secondary" className="ml-2 bg-green-500">
                                        {team.teamUsers.length} {team.teamUsers.length === 1 ? "member" : "members"}
                                    </Badge>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 bg-background">
                                    {team.teamUsers.length > 0 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                                                Team Members
                                            </h4>
                                            <div className="grid gap-4">
                                                {team.teamUsers.map((user, index) => (
                                                    <div
                                                        key={user.teamUserId}
                                                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</span>
                                                                <Avatar className="h-10 w-10 border-2 border-border">
                                                                    <AvatarImage
                                                                        src={`/abstract-geometric-shapes.png?key=5m1rd&height=40&width=40&query=${user.userName}`}
                                                                    />
                                                                    <AvatarFallback className="bg-secondary/10 font-semibold">
                                                                        {(user.userName || "U").charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>

                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-card-foreground">
                                                                    {user.userName || "Unknown User"}
                                                                </h5>
                                                                {user.userNumberCode && (
                                                                    <span className="text-sm text-muted-foreground">{user.userNumberCode}</span>
                                                                )}
                                                                {user.userEmail && (
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-sm text-muted-foreground">{user.userEmail}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-card-foreground mb-2">No Members Yet</h4>
                                            <p className="text-muted-foreground">This team doesn't have any members yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </div>
                )
            })}
        </div>
    )
}