UPDATE flows SET special_general = '0' WHERE special_general IS NULL;
UPDATE expimp_spegen SET special_general = '0' WHERE special_general IS NULL;