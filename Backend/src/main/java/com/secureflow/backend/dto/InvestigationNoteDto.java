package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationNoteDto {
    private String id;
    private String authorName;
    private String note;
    private String createdAt;
}
